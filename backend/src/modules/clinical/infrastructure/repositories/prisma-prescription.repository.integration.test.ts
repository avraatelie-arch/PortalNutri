import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import {
  createClinicalIntegrationEncounterHandlers,
  resetClinicalIntegrationDatabase,
  seedClinicalIntegrationBase,
  seedClinicalIntegrationDraftAnamnesisContext,
  type ClinicalIntegrationDraftAnamnesisContext,
  type ClinicalIntegrationFixtureSeed,
} from '../../../../test-support/clinical-integration-fixture.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreatePrescriptionCommand } from '../../application/create-prescription/create-prescription.command.js';
import { CreatePrescriptionHandler } from '../../application/create-prescription/create-prescription.handler.js';
import { EmitPrescriptionCommand } from '../../application/emit-prescription/emit-prescription.command.js';
import { EmitPrescriptionHandler } from '../../application/emit-prescription/emit-prescription.handler.js';
import { FindIssuedPrescriptionsByPatientQuery } from '../../application/find-issued-prescriptions-by-patient/find-issued-prescriptions-by-patient.query.js';
import { FindIssuedPrescriptionsByPatientHandler } from '../../application/find-issued-prescriptions-by-patient/find-issued-prescriptions-by-patient.handler.js';
import { FindPrescriptionQuery } from '../../application/find-prescription/find-prescription.query.js';
import { FindPrescriptionHandler } from '../../application/find-prescription/find-prescription.handler.js';
import { FindPrescriptionsByPatientQuery } from '../../application/find-prescriptions-by-patient/find-prescriptions-by-patient.query.js';
import { FindPrescriptionsByPatientHandler } from '../../application/find-prescriptions-by-patient/find-prescriptions-by-patient.handler.js';
import { PrescriptionId } from '../../domain/value-objects/prescription-id.js';
import { PrescriptionStatusValue } from '../../domain/value-objects/prescription-status.js';
import { PrismaMembershipRepository } from '../../../iam/infrastructure/repositories/prisma-membership.repository.js';
import { PrismaPersonRepository } from '../../../iam/infrastructure/repositories/prisma-person.repository.js';
import { PrismaTenantRepository } from '../../../iam/infrastructure/repositories/prisma-tenant.repository.js';
import { PrismaNutritionistRepository } from '../../../nutrition/infrastructure/repositories/prisma-nutritionist.repository.js';
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
import { PrismaPrescriptionRepository } from './prisma-prescription.repository.js';

requireDatabaseUrl();

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');

const prisma = new PrismaClient();
const encounterRepository = new PrismaClinicalEncounterRepository(prisma);
const anamnesisRepository = new PrismaAnamnesisRepository(prisma);
const prescriptionRepository = new PrismaPrescriptionRepository(prisma);
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

const fixtureRepositories = {
  prisma,
  tenantRepository,
  personRepository,
  membershipRepository,
  nutritionistRepository,
  patientRepository,
  assignmentRepository,
  encounterRepository,
  anamnesisRepository,
};

const fixtureDirectories = {
  patientNutritionistDirectory,
  clinicalTenantDirectory,
  clinicalPatientDirectory,
  clinicalNutritionistDirectory,
  clinicalAppointmentDirectory,
  clinicalEncounterDirectory,
  anamnesisDirectory,
};

const encounterHandlers = createClinicalIntegrationEncounterHandlers(
  fixtureRepositories,
  fixtureDirectories,
  clock,
  noopEventDispatcher,
);

function createHandler(customClock = clock) {
  return new CreatePrescriptionHandler(
    prescriptionRepository,
    clinicalTenantDirectory,
    patientClinicalDirectory,
    clinicalNutritionistDirectory,
    clinicalEncounterDirectory,
    anamnesisDirectory,
    customClock,
    noopEventDispatcher,
  );
}

function createCommand(
  fixture: ClinicalIntegrationFixtureSeed,
  context: ClinicalIntegrationDraftAnamnesisContext,
  overrides?: Partial<CreatePrescriptionCommand['request']>,
) {
  return new CreatePrescriptionCommand({
    tenantId: fixture.tenant.id,
    patientId: fixture.patient.id,
    createdByNutritionistId: fixture.nutritionist.id,
    responsibleNutritionistId: fixture.nutritionist.id,
    originClinicalEncounterId: context.encounter.id,
    originAnamnesisId: context.anamnesis.id,
    title: 'Therapeutic prescription',
    lines: [
      {
        sortOrder: 1,
        description: 'Omega-3 supplement',
        doseQuantity: '1000',
        doseUnit: 'MG',
        frequencyDisplayText: 'Once daily with breakfast',
      },
    ],
    ...overrides,
  });
}

async function createFixture(slugSuffix?: string) {
  return seedClinicalIntegrationBase(
    fixtureRepositories,
    fixtureDirectories,
    noopEventDispatcher,
    {
      slug: slugSuffix ?? `prescription-${Date.now()}`,
      emailPrefix: 'prescription',
      tenantName: 'Prescription Clinic',
    },
  );
}

describe('PrismaPrescriptionRepository (integration)', () => {
  before(async () => {
    await resetClinicalIntegrationDatabase(prisma, { includeAssessments: true });
  });

  beforeEach(async () => {
    await resetClinicalIntegrationDatabase(prisma, { includeAssessments: true });
  });

  after(async () => {
    await resetClinicalIntegrationDatabase(prisma, { includeAssessments: true });
    await prisma.$disconnect();
  });

  it('persists and finds a prescription by tenant and id', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));
    const findHandler = new FindPrescriptionHandler(prescriptionRepository);

    const found = await findHandler.execute(
      new FindPrescriptionQuery({
        tenantId: fixture.tenant.id,
        prescriptionId: created.id,
      }),
    );

    assert.equal(found.id, created.id);
    assert.equal(found.status, PrescriptionStatusValue.Draft);
    assert.equal(found.originClinicalEncounterId, context.encounter.id);
    assert.equal(found.lines.length, 1);
    assert.equal(found.lines[0]?.description, 'Omega-3 supplement');
  });

  it('scopes findByTenantAndId to tenant', async () => {
    const fixtureOne = await createFixture(`rx-scope-a-${Date.now()}`);
    const fixtureTwo = await createFixture(`rx-scope-b-${Date.now() + 1}`);
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixtureOne,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixtureOne, context));

    const crossTenant = await prescriptionRepository.findByTenantAndId(
      fixtureTwo.tenant.id,
      PrescriptionId.create(created.id),
    );

    assert.equal(crossTenant, null);
  });

  it('stores lifecycle timestamps after emit', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));
    const emitted = await new EmitPrescriptionHandler(
      prescriptionRepository,
      laterClock,
      noopEventDispatcher,
    ).execute(
      new EmitPrescriptionCommand({
        tenantId: fixture.tenant.id,
        prescriptionId: created.id,
      }),
    );

    assert.equal(emitted.status, PrescriptionStatusValue.Issued);
    assert.equal(emitted.issuedAt, LATER.toISOString());
    assert.equal(emitted.version, 2);

    const row = await prisma.prescription.findUnique({ where: { id: created.id } });
    assert.ok(row?.issuedAt);
  });

  it('finds prescriptions by status', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));
    await new EmitPrescriptionHandler(
      prescriptionRepository,
      laterClock,
      noopEventDispatcher,
    ).execute(
      new EmitPrescriptionCommand({
        tenantId: fixture.tenant.id,
        prescriptionId: created.id,
      }),
    );

    const draftResults = await prescriptionRepository.findByStatus(
      fixture.tenant.id,
      PrescriptionStatusValue.Draft,
    );
    const issuedResults = await prescriptionRepository.findByStatus(
      fixture.tenant.id,
      PrescriptionStatusValue.Issued,
    );

    assert.equal(draftResults.length, 0);
    assert.equal(issuedResults.length, 1);
  });

  it('finds issued prescriptions by patient through query handler', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));
    await new EmitPrescriptionHandler(
      prescriptionRepository,
      laterClock,
      noopEventDispatcher,
    ).execute(
      new EmitPrescriptionCommand({
        tenantId: fixture.tenant.id,
        prescriptionId: created.id,
      }),
    );

    const findHandler = new FindIssuedPrescriptionsByPatientHandler(prescriptionRepository);
    const results = await findHandler.execute(
      new FindIssuedPrescriptionsByPatientQuery({
        tenantId: fixture.tenant.id,
        patientId: fixture.patient.id,
      }),
    );

    assert.equal(results.length, 1);
    assert.equal(results[0]?.id, created.id);
  });

  it('findLatestByPatient returns most recent by effective date', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );

    const older = await createHandler(clock).execute(createCommand(fixture, context));
    await new EmitPrescriptionHandler(
      prescriptionRepository,
      clock,
      noopEventDispatcher,
    ).execute(
      new EmitPrescriptionCommand({
        tenantId: fixture.tenant.id,
        prescriptionId: older.id,
      }),
    );

    const newer = await createHandler(laterClock).execute(
      createCommand(fixture, context, { title: 'Second prescription' }),
    );

    const latest = await prescriptionRepository.findLatestByPatient(
      fixture.tenant.id,
      fixture.patient.id,
    );

    assert.ok(latest);
    assert.equal(latest.getId().toString(), newer.id);
  });

  it('filters patient prescriptions by status in query handler', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));

    const findHandler = new FindPrescriptionsByPatientHandler(prescriptionRepository);
    const draftResults = await findHandler.execute(
      new FindPrescriptionsByPatientQuery({
        tenantId: fixture.tenant.id,
        patientId: fixture.patient.id,
        status: PrescriptionStatusValue.Draft,
      }),
    );

    assert.equal(draftResults.length, 1);
    assert.equal(draftResults[0]?.id, created.id);
  });

  it('allows prescriptions without origin references', async () => {
    const fixture = await createFixture();
    const created = await createHandler().execute(
      new CreatePrescriptionCommand({
        tenantId: fixture.tenant.id,
        patientId: fixture.patient.id,
        createdByNutritionistId: fixture.nutritionist.id,
        responsibleNutritionistId: fixture.nutritionist.id,
        title: 'Standalone prescription',
        lines: [
          {
            sortOrder: 1,
            description: 'Magnesium glycinate',
            doseQuantity: '200',
            doseUnit: 'MG',
            frequencyDisplayText: 'At bedtime',
          },
        ],
      }),
    );

    assert.equal(created.originClinicalEncounterId, null);
    assert.equal(created.originAnamnesisId, null);
  });
});
