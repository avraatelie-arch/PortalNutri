import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { RecordAnthropometricAssessmentCommand } from '../../application/record-anthropometric-assessment/record-anthropometric-assessment.command.js';
import { RecordAnthropometricAssessmentHandler } from '../../application/record-anthropometric-assessment/record-anthropometric-assessment.handler.js';
import { FindAnthropometricAssessmentQuery } from '../../application/find-anthropometric-assessment/find-anthropometric-assessment.query.js';
import { FindAnthropometricAssessmentHandler } from '../../application/find-anthropometric-assessment/find-anthropometric-assessment.handler.js';
import { FindAnthropometricAssessmentsByAnamnesisQuery } from '../../application/find-anthropometric-assessments-by-anamnesis/find-anthropometric-assessments-by-anamnesis.query.js';
import { FindAnthropometricAssessmentsByAnamnesisHandler } from '../../application/find-anthropometric-assessments-by-anamnesis/find-anthropometric-assessments-by-anamnesis.handler.js';
import { FindAnthropometricAssessmentsByPatientQuery } from '../../application/find-anthropometric-assessments-by-patient/find-anthropometric-assessments-by-patient.query.js';
import { FindAnthropometricAssessmentsByPatientHandler } from '../../application/find-anthropometric-assessments-by-patient/find-anthropometric-assessments-by-patient.handler.js';
import { StartAnamnesisCommand } from '../../application/start-anamnesis/start-anamnesis.command.js';
import { StartAnamnesisHandler } from '../../application/start-anamnesis/start-anamnesis.handler.js';
import { StartClinicalEncounterCommand } from '../../application/start-clinical-encounter/start-clinical-encounter.command.js';
import { StartClinicalEncounterHandler } from '../../application/start-clinical-encounter/start-clinical-encounter.handler.js';
import { DefaultBodyMassIndexClassificationPolicy } from '../../domain/policies/body-mass-index-classification-policy.js';
import { AnthropometricAssessmentId } from '../../domain/value-objects/anthropometric-assessment-id.js';
import { ClinicalEncounterTypeValue } from '../../domain/value-objects/clinical-encounter-type.js';
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
import { PrismaAnamnesisDirectoryAdapter } from '../adapters/prisma-anamnesis-directory.adapter.js';
import { PrismaAppointmentDirectoryAdapter } from '../adapters/prisma-appointment-directory.adapter.js';
import { PrismaClinicalEncounterDirectoryAdapter } from '../adapters/prisma-clinical-encounter-directory.adapter.js';
import { PrismaNutritionistDirectoryAdapter as ClinicalNutritionistDirectoryAdapter } from '../adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaPatientClinicalDirectoryAdapter } from '../adapters/prisma-patient-clinical-directory.adapter.js';
import { PrismaPatientDirectoryAdapter } from '../adapters/prisma-patient-directory.adapter.js';
import { PrismaTenantDirectoryAdapter } from '../adapters/prisma-tenant-directory.adapter.js';
import { PrismaClinicalEncounterRepository } from './prisma-clinical-encounter.repository.js';
import { PrismaAnamnesisRepository } from './prisma-anamnesis.repository.js';
import { PrismaAnthropometricAssessmentRepository } from './prisma-anthropometric-assessment.repository.js';

requireDatabaseUrl();

const NOW = new Date('2026-07-17T10:00:00.000Z');
const LATER = new Date('2026-07-17T11:00:00.000Z');

const prisma = new PrismaClient();
const encounterRepository = new PrismaClinicalEncounterRepository(prisma);
const anamnesisRepository = new PrismaAnamnesisRepository(prisma);
const anthropometricRepository = new PrismaAnthropometricAssessmentRepository(prisma);
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
const anamnesisDirectory = new PrismaAnamnesisDirectoryAdapter(prisma);
const patientClinicalDirectory = new PrismaPatientClinicalDirectoryAdapter(prisma);

const clock = new FixedClock(NOW);
const laterClock = new FixedClock(LATER);

async function resetDatabase() {
  await prisma.anthropometricAssessment.deleteMany();
  await prisma.anamnesis.deleteMany();
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

async function createFixture(options?: { patientBirthDate?: string; slug?: string }) {
  const person = await new CreatePersonHandler(
    personRepository,
    noopEventDispatcher,
  ).execute(
    new CreatePersonCommand({
      fullName: 'Ana Nutricionista',
      email: `ana.anthro.${Date.now()}@example.com`,
      documentType: DocumentType.PASSPORT,
      document: `AN${Date.now()}`,
      birthDate: '1988-03-20',
    }),
  );

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Anthropometry Clinic',
      slug: options?.slug ?? `anthro-clinic-${Date.now()}`,
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
      crn: `${Date.now()}`.slice(-5),
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
      birthDate: options?.patientBirthDate ?? '1992-07-10',
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

function createRecordHandler(customClock = clock) {
  return new RecordAnthropometricAssessmentHandler(
    anthropometricRepository,
    clinicalTenantDirectory,
    anamnesisDirectory,
    clinicalEncounterDirectory,
    patientClinicalDirectory,
    new DefaultBodyMassIndexClassificationPolicy(),
    customClock,
    noopEventDispatcher,
  );
}

async function startEncounter(fixture: Awaited<ReturnType<typeof createFixture>>) {
  return new StartClinicalEncounterHandler(
    encounterRepository,
    clinicalTenantDirectory,
    clinicalPatientDirectory,
    clinicalNutritionistDirectory,
    clinicalAppointmentDirectory,
    clock,
    noopEventDispatcher,
  ).execute(
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
  return new StartAnamnesisHandler(
    anamnesisRepository,
    clinicalTenantDirectory,
    clinicalEncounterDirectory,
    clock,
    noopEventDispatcher,
  ).execute(
    new StartAnamnesisCommand({
      tenantId: fixture.tenant.id,
      clinicalEncounterId: encounterId,
      patientId: fixture.patient.id,
      nutritionistId: fixture.nutritionist.id,
    }),
  );
}

async function createClinicalContext(fixture: Awaited<ReturnType<typeof createFixture>>) {
  const encounter = await startEncounter(fixture);
  const anamnesis = await startAnamnesis(fixture, encounter.id);
  return { encounter, anamnesis };
}

function recordCommand(
  fixture: Awaited<ReturnType<typeof createFixture>>,
  context: Awaited<ReturnType<typeof createClinicalContext>>,
  overrides?: Partial<RecordAnthropometricAssessmentCommand['request']>,
) {
  return new RecordAnthropometricAssessmentCommand({
    tenantId: fixture.tenant.id,
    anamnesisId: context.anamnesis.id,
    clinicalEncounterId: context.encounter.id,
    patientId: fixture.patient.id,
    nutritionistId: fixture.nutritionist.id,
    weightKg: '72.50',
    heightCm: '170.00',
    waistCircumferenceCm: '84.30',
    hipCircumferenceCm: '98.00',
    ...overrides,
  });
}

describe('PrismaAnthropometricAssessmentRepository (integration)', () => {
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

  it('persists and finds an assessment by tenant and id', async () => {
    const fixture = await createFixture();
    const context = await createClinicalContext(fixture);
    const recordHandler = createRecordHandler();
    const findHandler = new FindAnthropometricAssessmentHandler(anthropometricRepository);

    const recorded = await recordHandler.execute(recordCommand(fixture, context));

    const found = await findHandler.execute(
      new FindAnthropometricAssessmentQuery({
        tenantId: fixture.tenant.id,
        assessmentId: recorded.id,
      }),
    );

    assert.equal(found.id, recorded.id);
    assert.equal(found.weightKg, '72.50');
    assert.equal(found.heightCm, '170.00');
    assert.equal(found.bodyMassIndex, '25.09');
    assert.equal(found.waistCircumferenceCm, '84.30');
    assert.equal(found.hipCircumferenceCm, '98.00');
    assert.equal(found.waistToHipRatio, '0.860');
    assert.equal(found.version, 1);
  });

  it('preserves decimal precision through persistence round-trip', async () => {
    const fixture = await createFixture();
    const context = await createClinicalContext(fixture);
    const recorded = await createRecordHandler().execute(
      recordCommand(fixture, context, {
        weightKg: '180.25',
        heightCm: '198.50',
      }),
    );

    const reloaded = await anthropometricRepository.findByTenantAndId(
      fixture.tenant.id,
      AnthropometricAssessmentId.create(recorded.id),
    );

    assert.ok(reloaded);
    assert.equal(reloaded.getWeight().toString(), '180.25');
    assert.equal(reloaded.getHeight().toString(), '198.50');
  });

  it('finds assessments by anamnesis with deterministic ordering', async () => {
    const fixture = await createFixture();
    const context = await createClinicalContext(fixture);
    const recordHandler = createRecordHandler();
    const laterRecordHandler = createRecordHandler(laterClock);
    const findHandler = new FindAnthropometricAssessmentsByAnamnesisHandler(
      anthropometricRepository,
    );

    const first = await recordHandler.execute(recordCommand(fixture, context));
    const second = await laterRecordHandler.execute(recordCommand(fixture, context));

    const results = await findHandler.execute(
      new FindAnthropometricAssessmentsByAnamnesisQuery({
        tenantId: fixture.tenant.id,
        anamnesisId: context.anamnesis.id,
      }),
    );

    assert.equal(results.length, 2);
    assert.equal(results[0]?.id, second.id);
    assert.equal(results[1]?.id, first.id);
  });

  it('finds assessments by patient with date range', async () => {
    const fixture = await createFixture();
    const context = await createClinicalContext(fixture);
    const recordHandler = createRecordHandler();
    const laterRecordHandler = createRecordHandler(laterClock);
    const findHandler = new FindAnthropometricAssessmentsByPatientHandler(
      anthropometricRepository,
    );

    await recordHandler.execute(recordCommand(fixture, context));
    const later = await laterRecordHandler.execute(recordCommand(fixture, context));

    const results = await findHandler.execute(
      new FindAnthropometricAssessmentsByPatientQuery({
        tenantId: fixture.tenant.id,
        patientId: fixture.patient.id,
        measuredFrom: LATER,
        measuredTo: LATER,
      }),
    );

    assert.equal(results.length, 1);
    assert.equal(results[0]?.id, later.id);
  });

  it('allows multiple null source request ids in the same tenant', async () => {
    const fixture = await createFixture();
    const context = await createClinicalContext(fixture);
    const recordHandler = createRecordHandler();
    const laterRecordHandler = createRecordHandler(laterClock);

    await recordHandler.execute(recordCommand(fixture, context));
    await laterRecordHandler.execute(recordCommand(fixture, context));

    const count = await prisma.anthropometricAssessment.count({
      where: { tenantId: fixture.tenant.id, sourceRequestId: null },
    });

    assert.equal(count, 2);
  });

  it('rejects duplicate non-null source request id in the same tenant', async () => {
    const fixture = await createFixture();
    const context = await createClinicalContext(fixture);
    const recordHandler = createRecordHandler();

    await recordHandler.execute(
      recordCommand(fixture, context, { sourceRequestId: 'device-reading-001' }),
    );

    await assert.rejects(
      () =>
        recordHandler.execute(
          recordCommand(fixture, context, { sourceRequestId: 'device-reading-001' }),
        ),
      (error: unknown) =>
        error instanceof Error && error.name === 'AnthropometricAssessmentDuplicateRequestError',
    );
  });

  it('allows same source request id in different tenants', async () => {
    const fixtureOne = await createFixture({ slug: `anthro-a-${Date.now()}` });
    const fixtureTwo = await createFixture({ slug: `anthro-b-${Date.now() + 1}` });
    const contextOne = await createClinicalContext(fixtureOne);
    const contextTwo = await createClinicalContext(fixtureTwo);
    const recordHandler = createRecordHandler();

    await recordHandler.execute(
      recordCommand(fixtureOne, contextOne, { sourceRequestId: 'shared-device-id' }),
    );
    await recordHandler.execute(
      recordCommand(fixtureTwo, contextTwo, { sourceRequestId: 'shared-device-id' }),
    );

    assert.equal(await prisma.anthropometricAssessment.count(), 2);
  });

  it('maintains foreign key integrity with clinical references', async () => {
    const fixture = await createFixture();
    const context = await createClinicalContext(fixture);
    const recorded = await createRecordHandler().execute(recordCommand(fixture, context));

    const row = await prisma.anthropometricAssessment.findUnique({
      where: { id: recorded.id },
    });

    assert.ok(row);
    assert.equal(row.anamnesisId, context.anamnesis.id);
    assert.equal(row.clinicalEncounterId, context.encounter.id);
    assert.equal(row.patientId, fixture.patient.id);
    assert.equal(row.nutritionistId, fixture.nutritionist.id);
  });

  it('scopes findByTenantAndId to tenant', async () => {
    const fixtureOne = await createFixture({ slug: `anthro-scope-a-${Date.now()}` });
    const fixtureTwo = await createFixture({ slug: `anthro-scope-b-${Date.now() + 1}` });
    const contextOne = await createClinicalContext(fixtureOne);
    const recorded = await createRecordHandler().execute(
      recordCommand(fixtureOne, contextOne),
    );

    const crossTenant = await anthropometricRepository.findByTenantAndId(
      fixtureTwo.tenant.id,
      AnthropometricAssessmentId.create(recorded.id),
    );

    assert.equal(crossTenant, null);
  });

  it('restores persisted derived values without recalculation', async () => {
    const fixture = await createFixture();
    const context = await createClinicalContext(fixture);
    const recorded = await createRecordHandler().execute(recordCommand(fixture, context));

    const reloaded = await anthropometricRepository.findByTenantAndId(
      fixture.tenant.id,
      AnthropometricAssessmentId.create(recorded.id),
    );

    assert.ok(reloaded);
    assert.equal(reloaded.getBodyMassIndex().toString(), recorded.bodyMassIndex);
    assert.equal(
      reloaded.getBodyMassIndexClassification(),
      recorded.bodyMassIndexClassification,
    );
    assert.equal(reloaded.getWaistToHipRatio()?.toString(), recorded.waistToHipRatio);
  });
});
