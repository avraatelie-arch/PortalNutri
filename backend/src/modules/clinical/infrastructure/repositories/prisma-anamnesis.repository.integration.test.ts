import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CompleteAnamnesisCommand } from '../../application/complete-anamnesis/complete-anamnesis.command.js';
import { CompleteAnamnesisHandler } from '../../application/complete-anamnesis/complete-anamnesis.handler.js';
import { FindAnamnesisByClinicalEncounterQuery } from '../../application/find-anamnesis-by-clinical-encounter/find-anamnesis-by-clinical-encounter.query.js';
import { FindAnamnesisByClinicalEncounterHandler } from '../../application/find-anamnesis-by-clinical-encounter/find-anamnesis-by-clinical-encounter.handler.js';
import { FindAnamnesisQuery } from '../../application/find-anamnesis/find-anamnesis.query.js';
import { FindAnamnesisHandler } from '../../application/find-anamnesis/find-anamnesis.handler.js';
import { StartAnamnesisCommand } from '../../application/start-anamnesis/start-anamnesis.command.js';
import { StartAnamnesisHandler } from '../../application/start-anamnesis/start-anamnesis.handler.js';
import { UpdateAnamnesisSectionCommand } from '../../application/update-anamnesis-section/update-anamnesis-section.command.js';
import { UpdateAnamnesisSectionHandler } from '../../application/update-anamnesis-section/update-anamnesis-section.handler.js';
import { AddPersonToTenantCommand } from '../../../iam/application/add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../../../iam/application/add-person-to-tenant/add-person-to-tenant.handler.js';
import { CreatePersonCommand } from '../../../iam/application/create-person/create-person.command.js';
import { CreatePersonHandler } from '../../../iam/application/create-person/create-person.handler.js';
import { CreateTenantCommand } from '../../../iam/application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../../iam/application/create-tenant/create-tenant.handler.js';
import { DocumentType } from '../../../iam/domain/value-objects/document.js';
import { PrismaMembershipRepository } from '../../../iam/infrastructure/repositories/prisma-membership.repository.js';
import { PrismaPersonRepository } from '../../../iam/infrastructure/repositories/prisma-person.repository.js';
import { PrismaTenantRepository } from '../../../iam/infrastructure/repositories/prisma-tenant.repository.js';
import { CreateNutritionistCommand } from '../../../nutrition/application/create-nutritionist/create-nutritionist.command.js';
import { CreateNutritionistHandler } from '../../../nutrition/application/create-nutritionist/create-nutritionist.handler.js';
import { PrismaNutritionistRepository } from '../../../nutrition/infrastructure/repositories/prisma-nutritionist.repository.js';
import { AssignNutritionistToPatientCommand } from '../../../patient/application/assign-nutritionist-to-patient/assign-nutritionist-to-patient.command.js';
import { AssignNutritionistToPatientHandler } from '../../../patient/application/assign-nutritionist-to-patient/assign-nutritionist-to-patient.handler.js';
import { CreatePatientCommand } from '../../../patient/application/create-patient/create-patient.command.js';
import { CreatePatientHandler } from '../../../patient/application/create-patient/create-patient.handler.js';
import { PatientNutritionistAssignmentRoleValue } from '../../../patient/domain/value-objects/patient-nutritionist-assignment-role.js';
import { PrismaNutritionistDirectoryAdapter } from '../../../patient/infrastructure/adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaPatientRepository } from '../../../patient/infrastructure/repositories/prisma-patient.repository.js';
import { PrismaPatientNutritionistAssignmentRepository } from '../../../patient/infrastructure/repositories/prisma-patient-nutritionist-assignment.repository.js';
import { StartClinicalEncounterCommand } from '../../application/start-clinical-encounter/start-clinical-encounter.command.js';
import { StartClinicalEncounterHandler } from '../../application/start-clinical-encounter/start-clinical-encounter.handler.js';
import { Anamnesis } from '../../domain/aggregates/anamnesis.aggregate.js';
import { DefaultAnamnesisCompletionPolicy } from '../../domain/policies/anamnesis-completion-policy.js';
import { AnamnesisId } from '../../domain/value-objects/anamnesis-id.js';
import { AnamnesisSectionValue } from '../../domain/value-objects/anamnesis-section.js';
import { AnamnesisStatus } from '../../domain/value-objects/anamnesis-status.js';
import {
  ClinicalEncounterTypeValue,
} from '../../domain/value-objects/clinical-encounter-type.js';
import { PrismaAppointmentDirectoryAdapter } from '../adapters/prisma-appointment-directory.adapter.js';
import { PrismaClinicalEncounterDirectoryAdapter } from '../adapters/prisma-clinical-encounter-directory.adapter.js';
import { PrismaNutritionistDirectoryAdapter as ClinicalNutritionistDirectoryAdapter } from '../adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaPatientDirectoryAdapter } from '../adapters/prisma-patient-directory.adapter.js';
import { PrismaTenantDirectoryAdapter } from '../adapters/prisma-tenant-directory.adapter.js';
import { PrismaClinicalEncounterRepository } from './prisma-clinical-encounter.repository.js';
import { PrismaAnamnesisRepository } from './prisma-anamnesis.repository.js';

requireDatabaseUrl();

const NOW = new Date('2026-07-17T10:00:00.000Z');
const LATER = new Date('2026-07-17T11:00:00.000Z');
const FUTURE_START = '2026-07-18T14:00:00.000Z';
const FUTURE_END_15 = '2026-07-18T14:15:00.000Z';

const ANAMNESIS_ID_ONE = '550e8400-e29b-41d4-a716-446655440060';
const ANAMNESIS_ID_TWO = '550e8400-e29b-41d4-a716-446655440061';

const SPEC_INPUT = '  Patient reports   nausea.\r\n\r\n  Symptoms worsen at night.  ';
const SPEC_NORMALIZED = 'Patient reports nausea.\n\nSymptoms worsen at night.';

const prisma = new PrismaClient();
const encounterRepository = new PrismaClinicalEncounterRepository(prisma);
const anamnesisRepository = new PrismaAnamnesisRepository(prisma);
const tenantRepository = new PrismaTenantRepository(prisma);
const personRepository = new PrismaPersonRepository(prisma);
const membershipRepository = new PrismaMembershipRepository(prisma);
const nutritionistRepository = new PrismaNutritionistRepository(prisma);
const patientRepository = new PrismaPatientRepository(prisma);
const assignmentRepository = new PrismaPatientNutritionistAssignmentRepository(prisma);

const patientNutritionistDirectory = new PrismaNutritionistDirectoryAdapter(prisma);

const clinicalTenantDirectory = new PrismaTenantDirectoryAdapter(prisma);
const clinicalPatientDirectory = new PrismaPatientDirectoryAdapter(prisma);
const clinicalNutritionistDirectory = new ClinicalNutritionistDirectoryAdapter(prisma);
const clinicalAppointmentDirectory = new PrismaAppointmentDirectoryAdapter(prisma);
const clinicalEncounterDirectory = new PrismaClinicalEncounterDirectoryAdapter(prisma);

const clock = new FixedClock(NOW);
const laterClock = new FixedClock(LATER);

async function resetDatabase() {
  await prisma.anamnesis.deleteMany();
  await prisma.clinicalEvolution.deleteMany();
  await prisma.clinicalEncounter.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.patientNutritionistAssignment.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.nutritionist.deleteMany();
  await prisma.permissionAssignment.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.roleAssignment.deleteMany();
  await prisma.role.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.session.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.person.deleteMany();
  await prisma.tenant.deleteMany();
}

async function createFixture() {
  const person = await new CreatePersonHandler(
    personRepository,
    noopEventDispatcher,
  ).execute(
    new CreatePersonCommand({
      fullName: 'Ana Nutricionista',
      email: 'ana.anamnesis@example.com',
      documentType: DocumentType.PASSPORT,
      document: 'AN123456',
      birthDate: '1988-03-20',
    }),
  );

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Anamnesis Clinic',
      slug: 'anamnesis-clinic',
    }),
  );

  await new AddPersonToTenantHandler(
    membershipRepository,
    personRepository,
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new AddPersonToTenantCommand({
      personId: person.id,
      tenantId: tenant.id,
    }),
  );

  const nutritionist = await new CreateNutritionistHandler(
    nutritionistRepository,
    personRepository,
    tenantRepository,
    membershipRepository,
    noopEventDispatcher,
  ).execute(
    new CreateNutritionistCommand({
      personId: person.id,
      tenantId: tenant.id,
      crn: '87654',
      stateCode: 'SP',
      specialty: 'Clinical Nutrition',
    }),
  );

  const patient = await new CreatePatientHandler(
    patientRepository,
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreatePatientCommand({
      tenantId: tenant.id,
      fullName: 'Carlos Paciente',
      birthDate: '1992-07-10',
      gender: 'MALE',
    }),
  );

  await new AssignNutritionistToPatientHandler(
    assignmentRepository,
    patientRepository,
    patientNutritionistDirectory,
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new AssignNutritionistToPatientCommand({
      tenantId: tenant.id,
      patientId: patient.id,
      nutritionistId: nutritionist.id,
      role: PatientNutritionistAssignmentRoleValue.Primary,
    }),
  );

  return { tenant, patient, nutritionist };
}

function createStartEncounterHandler() {
  return new StartClinicalEncounterHandler(
    encounterRepository,
    clinicalTenantDirectory,
    clinicalPatientDirectory,
    clinicalNutritionistDirectory,
    clinicalAppointmentDirectory,
    clock,
    noopEventDispatcher,
  );
}

function createStartAnamnesisHandler() {
  return new StartAnamnesisHandler(
    anamnesisRepository,
    clinicalTenantDirectory,
    clinicalEncounterDirectory,
    clock,
    noopEventDispatcher,
  );
}

function createUpdateSectionHandler() {
  return new UpdateAnamnesisSectionHandler(
    anamnesisRepository,
    laterClock,
    noopEventDispatcher,
  );
}

function createCompleteHandler() {
  return new CompleteAnamnesisHandler(
    anamnesisRepository,
    new DefaultAnamnesisCompletionPolicy(),
    laterClock,
    noopEventDispatcher,
  );
}

async function startEncounter(fixture: Awaited<ReturnType<typeof createFixture>>) {
  return createStartEncounterHandler().execute(
    new StartClinicalEncounterCommand({
      tenantId: fixture.tenant.id,
      patientId: fixture.patient.id,
      nutritionistId: fixture.nutritionist.id,
      type: ClinicalEncounterTypeValue.Initial,
    }),
  );
}

async function startAnamnesis(
  fixture: Awaited<ReturnType<typeof createFixture>>,
  encounterId: string,
) {
  return createStartAnamnesisHandler().execute(
    new StartAnamnesisCommand({
      tenantId: fixture.tenant.id,
      clinicalEncounterId: encounterId,
      patientId: fixture.patient.id,
      nutritionistId: fixture.nutritionist.id,
    }),
  );
}

function createAnamnesisAggregate(params: {
  id: string;
  tenantId: string;
  clinicalEncounterId: string;
  patientId: string;
  nutritionistId: string;
}) {
  const anamnesis = Anamnesis.create({
    id: AnamnesisId.create(params.id),
    tenantId: params.tenantId,
    clinicalEncounterId: params.clinicalEncounterId,
    patientId: params.patientId,
    nutritionistId: params.nutritionistId,
    now: clock.now(),
  });
  anamnesis.clearDomainEvents();
  return anamnesis;
}

describe('PrismaAnamnesisRepository (integration)', () => {
  before(async () => {
    await resetDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  after(async () => {
    await resetDatabase();
    await prisma.$disconnect();
  });

  it('persists and finds an anamnesis by tenant and id', async () => {
    const fixture = await createFixture();
    const encounter = await startEncounter(fixture);
    const startHandler = createStartAnamnesisHandler();
    const findHandler = new FindAnamnesisHandler(anamnesisRepository);

    const started = await startHandler.execute(
      new StartAnamnesisCommand({
        tenantId: fixture.tenant.id,
        clinicalEncounterId: encounter.id,
        patientId: fixture.patient.id,
        nutritionistId: fixture.nutritionist.id,
      }),
    );

    const found = await findHandler.execute(
      new FindAnamnesisQuery({
        tenantId: fixture.tenant.id,
        anamnesisId: started.id,
      }),
    );

    assert.equal(found.id, started.id);
    assert.equal(found.tenantId, fixture.tenant.id);
    assert.equal(found.clinicalEncounterId, encounter.id);
    assert.equal(found.patientId, fixture.patient.id);
    assert.equal(found.nutritionistId, fixture.nutritionist.id);
    assert.equal(found.status, AnamnesisStatus.Draft);
    assert.equal(found.version, 1);
    assert.equal(found.completedAt, null);

    const aggregate = await anamnesisRepository.findByTenantAndId(
      fixture.tenant.id,
      AnamnesisId.create(started.id),
    );

    assert.ok(aggregate);
    assert.equal(aggregate.getTenantId(), fixture.tenant.id);
    assert.equal(aggregate.getStatus(), AnamnesisStatus.Draft);
  });

  it('finds anamnesis by clinical encounter', async () => {
    const fixture = await createFixture();
    const encounter = await startEncounter(fixture);
    const started = await startAnamnesis(fixture, encounter.id);
    const findHandler = new FindAnamnesisByClinicalEncounterHandler(
      anamnesisRepository,
    );

    const found = await findHandler.execute(
      new FindAnamnesisByClinicalEncounterQuery({
        tenantId: fixture.tenant.id,
        clinicalEncounterId: encounter.id,
      }),
    );

    assert.equal(found.id, started.id);
    assert.equal(found.clinicalEncounterId, encounter.id);

    const aggregate = await anamnesisRepository.findByClinicalEncounter(
      fixture.tenant.id,
      encounter.id,
    );

    assert.ok(aggregate);
    assert.equal(aggregate.getId().toString(), started.id);
  });

  it('reports existence by clinical encounter', async () => {
    const fixture = await createFixture();
    const encounter = await startEncounter(fixture);

    assert.equal(
      await anamnesisRepository.existsByClinicalEncounter(
        fixture.tenant.id,
        encounter.id,
      ),
      false,
    );

    await startAnamnesis(fixture, encounter.id);

    assert.equal(
      await anamnesisRepository.existsByClinicalEncounter(
        fixture.tenant.id,
        encounter.id,
      ),
      true,
    );
  });

  it('preserves paragraph text through persistence round-trip', async () => {
    const fixture = await createFixture();
    const encounter = await startEncounter(fixture);
    const started = await startAnamnesis(fixture, encounter.id);

    await createUpdateSectionHandler().execute(
      new UpdateAnamnesisSectionCommand({
        tenantId: fixture.tenant.id,
        anamnesisId: started.id,
        section: AnamnesisSectionValue.Observations,
        content: SPEC_INPUT,
      }),
    );

    await createUpdateSectionHandler().execute(
      new UpdateAnamnesisSectionCommand({
        tenantId: fixture.tenant.id,
        anamnesisId: started.id,
        section: AnamnesisSectionValue.ChiefComplaint,
        content: 'Chief complaint for completion',
      }),
    );

    const aggregate = await anamnesisRepository.findByTenantAndId(
      fixture.tenant.id,
      AnamnesisId.create(started.id),
    );

    assert.ok(aggregate);
    assert.equal(aggregate.getObservations().toPersistence(), SPEC_NORMALIZED);
  });

  it('persists completion status and completedAt', async () => {
    const fixture = await createFixture();
    const encounter = await startEncounter(fixture);
    const started = await startAnamnesis(fixture, encounter.id);

    await createUpdateSectionHandler().execute(
      new UpdateAnamnesisSectionCommand({
        tenantId: fixture.tenant.id,
        anamnesisId: started.id,
        section: AnamnesisSectionValue.ChiefComplaint,
        content: 'Chief complaint for completion',
      }),
    );

    const completed = await createCompleteHandler().execute(
      new CompleteAnamnesisCommand({
        tenantId: fixture.tenant.id,
        anamnesisId: started.id,
      }),
    );

    assert.equal(completed.status, AnamnesisStatus.Completed);
    assert.equal(completed.completedAt, LATER.toISOString());
    assert.equal(completed.version, 3);

    const aggregate = await anamnesisRepository.findByTenantAndId(
      fixture.tenant.id,
      AnamnesisId.create(started.id),
    );

    assert.ok(aggregate);
    assert.equal(aggregate.getStatus(), AnamnesisStatus.Completed);
    assert.equal(aggregate.getCompletedAt()?.toISOString(), LATER.toISOString());
  });

  it('rejects duplicate clinicalEncounterId via unique constraint', async () => {
    const fixture = await createFixture();
    const encounter = await startEncounter(fixture);

    const first = createAnamnesisAggregate({
      id: ANAMNESIS_ID_ONE,
      tenantId: fixture.tenant.id,
      clinicalEncounterId: encounter.id,
      patientId: fixture.patient.id,
      nutritionistId: fixture.nutritionist.id,
    });

    await anamnesisRepository.save(first);

    const second = createAnamnesisAggregate({
      id: ANAMNESIS_ID_TWO,
      tenantId: fixture.tenant.id,
      clinicalEncounterId: encounter.id,
      patientId: fixture.patient.id,
      nutritionistId: fixture.nutritionist.id,
    });

    await assert.rejects(
      () => anamnesisRepository.save(second),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        return /Unique constraint failed/i.test(error.message);
      },
    );
  });

  it('maintains foreign key integrity with clinical encounter', async () => {
    const fixture = await createFixture();
    const encounter = await startEncounter(fixture);
    const started = await startAnamnesis(fixture, encounter.id);

    const record = await prisma.anamnesis.findUnique({
      where: { id: started.id },
      include: { clinicalEncounter: true },
    });

    assert.ok(record);
    assert.equal(record.clinicalEncounter.id, encounter.id);
    assert.equal(record.tenantId, fixture.tenant.id);
    assert.equal(record.patientId, fixture.patient.id);
    assert.equal(record.nutritionistId, fixture.nutritionist.id);
  });
});
