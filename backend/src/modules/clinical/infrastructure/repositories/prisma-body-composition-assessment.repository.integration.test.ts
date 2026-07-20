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
import { RecordBodyCompositionAssessmentCommand } from '../../application/record-body-composition-assessment/record-body-composition-assessment.command.js';
import { RecordBodyCompositionAssessmentHandler } from '../../application/record-body-composition-assessment/record-body-composition-assessment.handler.js';
import { FindBodyCompositionAssessmentQuery } from '../../application/find-body-composition-assessment/find-body-composition-assessment.query.js';
import { FindBodyCompositionAssessmentHandler } from '../../application/find-body-composition-assessment/find-body-composition-assessment.handler.js';
import { FindBodyCompositionAssessmentsByAnamnesisQuery } from '../../application/find-body-composition-assessments-by-anamnesis/find-body-composition-assessments-by-anamnesis.query.js';
import { FindBodyCompositionAssessmentsByAnamnesisHandler } from '../../application/find-body-composition-assessments-by-anamnesis/find-body-composition-assessments-by-anamnesis.handler.js';
import { FindBodyCompositionAssessmentsByPatientQuery } from '../../application/find-body-composition-assessments-by-patient/find-body-composition-assessments-by-patient.query.js';
import { FindBodyCompositionAssessmentsByPatientHandler } from '../../application/find-body-composition-assessments-by-patient/find-body-composition-assessments-by-patient.handler.js';
import { RecordAnthropometricAssessmentCommand } from '../../application/record-anthropometric-assessment/record-anthropometric-assessment.command.js';
import { RecordAnthropometricAssessmentHandler } from '../../application/record-anthropometric-assessment/record-anthropometric-assessment.handler.js';
import { BodyCompositionConsistencyPolicy } from '../../domain/policies/body-composition-consistency-policy.js';
import { DefaultBodyMassIndexClassificationPolicy } from '../../domain/policies/body-mass-index-classification-policy.js';
import { BodyCompositionAssessmentId } from '../../domain/value-objects/body-composition-assessment-id.js';
import { BodyCompositionMeasurementSourceValue } from '../../domain/value-objects/body-composition-measurement-source.js';
import { PrismaMembershipRepository } from '../../../iam/infrastructure/repositories/prisma-membership.repository.js';
import { PrismaPersonRepository } from '../../../iam/infrastructure/repositories/prisma-person.repository.js';
import { PrismaTenantRepository } from '../../../iam/infrastructure/repositories/prisma-tenant.repository.js';
import { PrismaNutritionistRepository } from '../../../nutrition/infrastructure/repositories/prisma-nutritionist.repository.js';
import { PrismaNutritionistDirectoryAdapter } from '../../../patient/infrastructure/adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaPatientRepository } from '../../../patient/infrastructure/repositories/prisma-patient.repository.js';
import { PrismaPatientNutritionistAssignmentRepository } from '../../../patient/infrastructure/repositories/prisma-patient-nutritionist-assignment.repository.js';
import { PrismaAnamnesisDirectoryAdapter } from '../adapters/prisma-anamnesis-directory.adapter.js';
import { PrismaAnthropometricAssessmentDirectoryAdapter } from '../adapters/prisma-anthropometric-assessment-directory.adapter.js';
import { PrismaAppointmentDirectoryAdapter } from '../adapters/prisma-appointment-directory.adapter.js';
import { PrismaClinicalEncounterDirectoryAdapter } from '../adapters/prisma-clinical-encounter-directory.adapter.js';
import { PrismaNutritionistDirectoryAdapter as ClinicalNutritionistDirectoryAdapter } from '../adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaPatientClinicalDirectoryAdapter } from '../adapters/prisma-patient-clinical-directory.adapter.js';
import { PrismaPatientDirectoryAdapter } from '../adapters/prisma-patient-directory.adapter.js';
import { PrismaTenantDirectoryAdapter } from '../adapters/prisma-tenant-directory.adapter.js';
import { PrismaClinicalEncounterRepository } from './prisma-clinical-encounter.repository.js';
import { PrismaAnamnesisRepository } from './prisma-anamnesis.repository.js';
import { PrismaAnthropometricAssessmentRepository } from './prisma-anthropometric-assessment.repository.js';
import { PrismaBodyCompositionAssessmentRepository } from './prisma-body-composition-assessment.repository.js';

requireDatabaseUrl();

const NOW = new Date('2026-07-17T10:00:00.000Z');
const LATER = new Date('2026-07-17T11:00:00.000Z');

const prisma = new PrismaClient();
const encounterRepository = new PrismaClinicalEncounterRepository(prisma);
const anamnesisRepository = new PrismaAnamnesisRepository(prisma);
const anthropometricRepository = new PrismaAnthropometricAssessmentRepository(prisma);
const bodyCompositionRepository = new PrismaBodyCompositionAssessmentRepository(prisma);
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
const anthropometricAssessmentDirectory =
  new PrismaAnthropometricAssessmentDirectoryAdapter(prisma);

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

async function createFixture(options?: { patientBirthDate?: string; slug?: string }) {
  return seedClinicalIntegrationBase(
    fixtureRepositories,
    fixtureDirectories,
    noopEventDispatcher,
    {
      patientBirthDate: options?.patientBirthDate,
      slug: options?.slug,
      emailPrefix: 'ana.bodycomp',
      tenantName: 'Body Composition Clinic',
    },
  );
}

function createRecordHandler(customClock = clock) {
  return new RecordBodyCompositionAssessmentHandler(
    bodyCompositionRepository,
    clinicalTenantDirectory,
    anamnesisDirectory,
    clinicalEncounterDirectory,
    patientClinicalDirectory,
    clinicalNutritionistDirectory,
    anthropometricAssessmentDirectory,
    new BodyCompositionConsistencyPolicy(),
    customClock,
    noopEventDispatcher,
  );
}

function createAnthropometricRecordHandler(customClock = clock) {
  return new RecordAnthropometricAssessmentHandler(
    anthropometricRepository,
    clinicalTenantDirectory,
    anamnesisDirectory,
    clinicalEncounterDirectory,
    patientClinicalDirectory,
    clinicalNutritionistDirectory,
    new DefaultBodyMassIndexClassificationPolicy(),
    customClock,
    noopEventDispatcher,
  );
}

async function createClinicalContext(fixture: ClinicalIntegrationFixtureSeed) {
  return seedClinicalIntegrationDraftAnamnesisContext(fixture, encounterHandlers);
}

function recordCommand(
  fixture: ClinicalIntegrationFixtureSeed,
  context: ClinicalIntegrationDraftAnamnesisContext,
  overrides?: Partial<RecordBodyCompositionAssessmentCommand['request']>,
) {
  return new RecordBodyCompositionAssessmentCommand({
    tenantId: fixture.tenant.id,
    anamnesisId: context.anamnesis.id,
    clinicalEncounterId: context.encounter.id,
    patientId: fixture.patient.id,
    nutritionistId: fixture.nutritionist.id,
    bodyFatPercentage: '22.50',
    measurementSource: BodyCompositionMeasurementSourceValue.Bioimpedance,
    leanMassKg: '56.20',
    fatMassKg: '16.30',
    basalMetabolicRate: '1875',
    metabolicAge: '42',
    ...overrides,
  });
}

describe('PrismaBodyCompositionAssessmentRepository (integration)', () => {
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

  it('persists and finds an assessment by tenant and id', async () => {
    const fixture = await createFixture();
    const context = await createClinicalContext(fixture);
    const recordHandler = createRecordHandler();
    const findHandler = new FindBodyCompositionAssessmentHandler(bodyCompositionRepository);

    const recorded = await recordHandler.execute(recordCommand(fixture, context));

    const found = await findHandler.execute(
      new FindBodyCompositionAssessmentQuery({
        tenantId: fixture.tenant.id,
        assessmentId: recorded.id,
      }),
    );

    assert.equal(found.id, recorded.id);
    assert.equal(found.bodyFatPercentage, '22.50');
    assert.equal(found.leanMassKg, '56.20');
    assert.equal(found.basalMetabolicRate, '1875');
    assert.equal(found.metabolicAge, '42');
    assert.equal(found.version, 1);
  });

  it('preserves decimal and integer precision through persistence round-trip', async () => {
    const fixture = await createFixture();
    const context = await createClinicalContext(fixture);
    const recorded = await createRecordHandler().execute(
      recordCommand(fixture, context, {
        bodyFatPercentage: '18.75',
        basalMetabolicRate: '2450',
      }),
    );

    const reloaded = await bodyCompositionRepository.findByTenantAndId(
      fixture.tenant.id,
      BodyCompositionAssessmentId.create(recorded.id),
    );

    assert.ok(reloaded);
    assert.equal(reloaded.getBodyFatPercentage().toString(), '18.75');
    assert.equal(reloaded.getBasalMetabolicRate()?.toString(), '2450');
  });

  it('finds assessments by anamnesis with deterministic ordering', async () => {
    const fixture = await createFixture();
    const context = await createClinicalContext(fixture);
    const recordHandler = createRecordHandler();
    const laterRecordHandler = createRecordHandler(laterClock);
    const findHandler = new FindBodyCompositionAssessmentsByAnamnesisHandler(
      bodyCompositionRepository,
    );

    const first = await recordHandler.execute(recordCommand(fixture, context));
    const second = await laterRecordHandler.execute(recordCommand(fixture, context));

    const results = await findHandler.execute(
      new FindBodyCompositionAssessmentsByAnamnesisQuery({
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
    const findHandler = new FindBodyCompositionAssessmentsByPatientHandler(
      bodyCompositionRepository,
    );

    await recordHandler.execute(recordCommand(fixture, context));
    const later = await laterRecordHandler.execute(recordCommand(fixture, context));

    const results = await findHandler.execute(
      new FindBodyCompositionAssessmentsByPatientQuery({
        tenantId: fixture.tenant.id,
        patientId: fixture.patient.id,
        measuredFrom: LATER,
        measuredTo: LATER,
      }),
    );

    assert.equal(results.length, 1);
    assert.equal(results[0]?.id, later.id);
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
        error instanceof Error && error.name === 'BodyCompositionAssessmentDuplicateRequestError',
    );
  });

  it('links optional anthropometric assessment', async () => {
    const fixture = await createFixture();
    const context = await createClinicalContext(fixture);
    const anthropometric = await createAnthropometricRecordHandler().execute(
      new RecordAnthropometricAssessmentCommand({
        tenantId: fixture.tenant.id,
        anamnesisId: context.anamnesis.id,
        clinicalEncounterId: context.encounter.id,
        patientId: fixture.patient.id,
        nutritionistId: fixture.nutritionist.id,
        weightKg: '72.50',
        heightCm: '170.00',
      }),
    );

    const recorded = await createRecordHandler().execute(
      recordCommand(fixture, context, {
        anthropometricAssessmentId: anthropometric.id,
      }),
    );

    assert.equal(recorded.anthropometricAssessmentId, anthropometric.id);
  });

  it('scopes findByTenantAndId to tenant', async () => {
    const fixtureOne = await createFixture({ slug: `bodycomp-scope-a-${Date.now()}` });
    const fixtureTwo = await createFixture({ slug: `bodycomp-scope-b-${Date.now() + 1}` });
    const contextOne = await createClinicalContext(fixtureOne);
    const recorded = await createRecordHandler().execute(
      recordCommand(fixtureOne, contextOne),
    );

    const crossTenant = await bodyCompositionRepository.findByTenantAndId(
      fixtureTwo.tenant.id,
      BodyCompositionAssessmentId.create(recorded.id),
    );

    assert.equal(crossTenant, null);
  });
});
