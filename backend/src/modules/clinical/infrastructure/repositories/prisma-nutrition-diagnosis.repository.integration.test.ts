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
import { ConfirmNutritionDiagnosisCommand } from '../../application/confirm-nutrition-diagnosis/confirm-nutrition-diagnosis.command.js';
import { ConfirmNutritionDiagnosisHandler } from '../../application/confirm-nutrition-diagnosis/confirm-nutrition-diagnosis.handler.js';
import { CreateNutritionDiagnosisCommand } from '../../application/create-nutrition-diagnosis/create-nutrition-diagnosis.command.js';
import { CreateNutritionDiagnosisHandler } from '../../application/create-nutrition-diagnosis/create-nutrition-diagnosis.handler.js';
import { FindConfirmedNutritionDiagnosesByPatientQuery } from '../../application/find-confirmed-nutrition-diagnoses-by-patient/find-confirmed-nutrition-diagnoses-by-patient.query.js';
import { FindConfirmedNutritionDiagnosesByPatientHandler } from '../../application/find-confirmed-nutrition-diagnoses-by-patient/find-confirmed-nutrition-diagnoses-by-patient.handler.js';
import { FindNutritionDiagnosisQuery } from '../../application/find-nutrition-diagnosis/find-nutrition-diagnosis.query.js';
import { FindNutritionDiagnosisHandler } from '../../application/find-nutrition-diagnosis/find-nutrition-diagnosis.handler.js';
import { FindNutritionDiagnosesByPatientQuery } from '../../application/find-nutrition-diagnoses-by-patient/find-nutrition-diagnoses-by-patient.query.js';
import { FindNutritionDiagnosesByPatientHandler } from '../../application/find-nutrition-diagnoses-by-patient/find-nutrition-diagnoses-by-patient.handler.js';
import { NutritionDiagnosisId } from '../../domain/value-objects/nutrition-diagnosis-id.js';
import { NutritionDiagnosisStatusValue } from '../../domain/value-objects/nutrition-diagnosis-status.js';
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
import { PrismaNutritionDiagnosisRepository } from './prisma-nutrition-diagnosis.repository.js';

requireDatabaseUrl();

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');

const prisma = new PrismaClient();
const encounterRepository = new PrismaClinicalEncounterRepository(prisma);
const anamnesisRepository = new PrismaAnamnesisRepository(prisma);
const nutritionDiagnosisRepository = new PrismaNutritionDiagnosisRepository(prisma);
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
  return new CreateNutritionDiagnosisHandler(
    nutritionDiagnosisRepository,
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
  overrides?: Partial<CreateNutritionDiagnosisCommand['request']>,
) {
  return new CreateNutritionDiagnosisCommand({
    tenantId: fixture.tenant.id,
    patientId: fixture.patient.id,
    createdByNutritionistId: fixture.nutritionist.id,
    responsibleNutritionistId: fixture.nutritionist.id,
    originClinicalEncounterId: context.encounter.id,
    originAnamnesisId: context.anamnesis.id,
    problemCategory: 'ENERGY_BALANCE',
    professionalInterpretation: 'Excessive energy intake relative to expenditure.',
    ...overrides,
  });
}

async function createFixture(slugSuffix?: string) {
  return seedClinicalIntegrationBase(
    fixtureRepositories,
    fixtureDirectories,
    noopEventDispatcher,
    {
      slug: slugSuffix ?? `nutrition-diagnosis-${Date.now()}`,
      emailPrefix: 'nutrition.diagnosis',
      tenantName: 'Nutrition Diagnosis Clinic',
    },
  );
}

describe('PrismaNutritionDiagnosisRepository (integration)', () => {
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

  it('persists and finds a nutrition diagnosis by tenant and id', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const createHandlerInstance = createHandler();
    const findHandler = new FindNutritionDiagnosisHandler(nutritionDiagnosisRepository);

    const created = await createHandlerInstance.execute(createCommand(fixture, context));

    const found = await findHandler.execute(
      new FindNutritionDiagnosisQuery({
        tenantId: fixture.tenant.id,
        nutritionDiagnosisId: created.id,
      }),
    );

    assert.equal(found.id, created.id);
    assert.equal(found.status, NutritionDiagnosisStatusValue.Draft);
    assert.equal(found.problemCategory, 'ENERGY_BALANCE');
    assert.equal(found.originClinicalEncounterId, context.encounter.id);
    assert.equal(found.originAnamnesisId, context.anamnesis.id);
  });

  it('scopes findByTenantAndId to tenant', async () => {
    const fixtureOne = await createFixture(`nd-scope-a-${Date.now()}`);
    const fixtureTwo = await createFixture(`nd-scope-b-${Date.now() + 1}`);
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixtureOne,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixtureOne, context));

    const crossTenant = await nutritionDiagnosisRepository.findByTenantAndId(
      fixtureTwo.tenant.id,
      NutritionDiagnosisId.create(created.id),
    );

    assert.equal(crossTenant, null);
  });

  it('stores lifecycle timestamps after confirmation', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));
    const confirmHandler = new ConfirmNutritionDiagnosisHandler(
      nutritionDiagnosisRepository,
      laterClock,
      noopEventDispatcher,
    );

    const confirmed = await confirmHandler.execute(
      new ConfirmNutritionDiagnosisCommand({
        tenantId: fixture.tenant.id,
        nutritionDiagnosisId: created.id,
      }),
    );

    assert.equal(confirmed.status, NutritionDiagnosisStatusValue.Confirmed);
    assert.equal(confirmed.confirmedAt, LATER.toISOString());
    assert.equal(confirmed.version, 2);

    const row = await prisma.nutritionDiagnosis.findUnique({ where: { id: created.id } });
    assert.ok(row?.confirmedAt);
  });

  it('maintains foreign key integrity with origin references', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));

    const row = await prisma.nutritionDiagnosis.findUnique({ where: { id: created.id } });

    assert.ok(row);
    assert.equal(row.originClinicalEncounterId, context.encounter.id);
    assert.equal(row.originAnamnesisId, context.anamnesis.id);
    assert.equal(row.patientId, fixture.patient.id);
    assert.equal(row.createdByNutritionistId, fixture.nutritionist.id);
  });

  it('finds diagnoses by status', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));
    await new ConfirmNutritionDiagnosisHandler(
      nutritionDiagnosisRepository,
      laterClock,
      noopEventDispatcher,
    ).execute(
      new ConfirmNutritionDiagnosisCommand({
        tenantId: fixture.tenant.id,
        nutritionDiagnosisId: created.id,
      }),
    );

    const draftResults = await nutritionDiagnosisRepository.findByStatus(
      fixture.tenant.id,
      NutritionDiagnosisStatusValue.Draft,
    );
    const confirmedResults = await nutritionDiagnosisRepository.findByStatus(
      fixture.tenant.id,
      NutritionDiagnosisStatusValue.Confirmed,
    );

    assert.equal(draftResults.length, 0);
    assert.equal(confirmedResults.length, 1);
    assert.equal(confirmedResults[0]?.getId().toString(), created.id);
  });

  it('finds confirmed diagnoses by patient through query handler', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));
    await new ConfirmNutritionDiagnosisHandler(
      nutritionDiagnosisRepository,
      laterClock,
      noopEventDispatcher,
    ).execute(
      new ConfirmNutritionDiagnosisCommand({
        tenantId: fixture.tenant.id,
        nutritionDiagnosisId: created.id,
      }),
    );

    const findHandler = new FindConfirmedNutritionDiagnosesByPatientHandler(
      nutritionDiagnosisRepository,
    );
    const results = await findHandler.execute(
      new FindConfirmedNutritionDiagnosesByPatientQuery({
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
    await new ConfirmNutritionDiagnosisHandler(
      nutritionDiagnosisRepository,
      clock,
      noopEventDispatcher,
    ).execute(
      new ConfirmNutritionDiagnosisCommand({
        tenantId: fixture.tenant.id,
        nutritionDiagnosisId: older.id,
      }),
    );

    const newer = await createHandler(laterClock).execute(
      createCommand(fixture, context, {
        problemCategory: 'DYSPHAGIA',
        professionalInterpretation: 'Newer diagnosis interpretation.',
      }),
    );

    const latest = await nutritionDiagnosisRepository.findLatestByPatient(
      fixture.tenant.id,
      fixture.patient.id,
    );

    assert.ok(latest);
    assert.equal(latest.getId().toString(), newer.id);
  });

  it('filters patient diagnoses by status in query handler', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));

    const findHandler = new FindNutritionDiagnosesByPatientHandler(
      nutritionDiagnosisRepository,
    );
    const draftResults = await findHandler.execute(
      new FindNutritionDiagnosesByPatientQuery({
        tenantId: fixture.tenant.id,
        patientId: fixture.patient.id,
        status: NutritionDiagnosisStatusValue.Draft,
      }),
    );

    assert.equal(draftResults.length, 1);
    assert.equal(draftResults[0]?.id, created.id);
  });

  it('updates version and timestamps on persistence round-trip', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));
    const confirmed = await new ConfirmNutritionDiagnosisHandler(
      nutritionDiagnosisRepository,
      laterClock,
      noopEventDispatcher,
    ).execute(
      new ConfirmNutritionDiagnosisCommand({
        tenantId: fixture.tenant.id,
        nutritionDiagnosisId: created.id,
      }),
    );

    const reloaded = await nutritionDiagnosisRepository.findByTenantAndId(
      fixture.tenant.id,
      NutritionDiagnosisId.create(created.id),
    );

    assert.ok(reloaded);
    assert.equal(reloaded.getVersion(), confirmed.version);
    assert.equal(reloaded.getUpdatedAt().toISOString(), LATER.toISOString());
  });

  it('allows diagnoses without origin references', async () => {
    const fixture = await createFixture();
    const created = await createHandler().execute(
      new CreateNutritionDiagnosisCommand({
        tenantId: fixture.tenant.id,
        patientId: fixture.patient.id,
        createdByNutritionistId: fixture.nutritionist.id,
        responsibleNutritionistId: fixture.nutritionist.id,
        problemCategory: 'OTHER',
        professionalInterpretation: 'Standalone diagnosis interpretation.',
      }),
    );

    assert.equal(created.originClinicalEncounterId, null);
    assert.equal(created.originAnamnesisId, null);

    const row = await prisma.nutritionDiagnosis.findUnique({ where: { id: created.id } });
    assert.ok(row);
    assert.equal(row.originClinicalEncounterId, null);
    assert.equal(row.originAnamnesisId, null);
  });
});
