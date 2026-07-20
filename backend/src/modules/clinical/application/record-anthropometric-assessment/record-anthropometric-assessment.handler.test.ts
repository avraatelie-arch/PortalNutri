import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { AnthropometricAssessment } from '../../domain/aggregates/anthropometric-assessment.aggregate.js';
import { DefaultBodyMassIndexClassificationPolicy } from '../../domain/policies/body-mass-index-classification-policy.js';
import { BodyMassIndexCalculator } from '../../domain/services/body-mass-index-calculator.js';
import { AnthropometricAssessmentId } from '../../domain/value-objects/anthropometric-assessment-id.js';
import { ClinicalSourceRequestId } from '../../domain/value-objects/clinical-source-request-id.js';
import { AnthropometricNotes } from '../../domain/value-objects/anthropometric-notes.js';
import { BodyHeight } from '../../domain/value-objects/body-height.js';
import { BodyMassIndexClassification } from '../../domain/value-objects/body-mass-index-classification.js';
import { BodyWeight } from '../../domain/value-objects/body-weight.js';
import { InMemoryAnamnesisDirectory } from '../../infrastructure/adapters/in-memory-anamnesis-directory.js';
import { InMemoryClinicalEncounterDirectory } from '../../infrastructure/adapters/in-memory-clinical-encounter-directory.js';
import { InMemoryNutritionistDirectory } from '../../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryPatientClinicalDirectory } from '../../infrastructure/adapters/in-memory-patient-clinical-directory.js';
import { InMemoryTenantDirectory } from '../../infrastructure/adapters/in-memory-tenant-directory.js';
import { InMemoryAnthropometricAssessmentRepository } from '../../infrastructure/repositories/in-memory-anthropometric-assessment.repository.js';
import { AnamnesisNotDraftForAnthropometryError } from '../errors/anamnesis-not-draft-for-anthropometry.error.js';
import { AnamnesisNotFoundForAnthropometryError } from '../errors/anamnesis-not-found-for-anthropometry.error.js';
import { AnthropometricAssessmentDuplicateRequestError } from '../errors/anthropometric-assessment-duplicate-request.error.js';
import { AnthropometricAssessmentBeforeBirthError } from '../errors/anthropometric-assessment-before-birth.error.js';
import { AnthropometricAssessmentFutureDateError } from '../errors/anthropometric-assessment-future-date.error.js';
import { AnthropometricAssessmentValidationError } from '../errors/anthropometric-assessment-validation.error.js';
import { ClinicalEncounterNotOpenForAnthropometryError } from '../errors/clinical-encounter-not-open-for-anthropometry.error.js';
import { PatientInactiveForAnthropometryError } from '../errors/patient-inactive-for-anthropometry.error.js';
import { TenantInactiveForAnthropometryError } from '../errors/tenant-inactive-for-anthropometry.error.js';
import { TenantNotFoundForAnthropometryError } from '../errors/tenant-not-found-for-anthropometry.error.js';
import { RecordAnthropometricAssessmentCommand } from './record-anthropometric-assessment.command.js';
import { RecordAnthropometricAssessmentHandler } from './record-anthropometric-assessment.handler.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const ADULT_BIRTH_DATE = new Date('1990-01-01T00:00:00.000Z');
const PEDIATRIC_BIRTH_DATE = new Date('2015-01-01T00:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const UNKNOWN_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';

function seedTenant(options?: { status?: 'ACTIVE' | 'INACTIVE' }) {
  const tenantDirectory = new InMemoryTenantDirectory();
  tenantDirectory.seed({
    id: TENANT_ID,
    status: options?.status ?? 'ACTIVE',
  });
  return tenantDirectory;
}

function seedAnamnesisDirectory(options?: {
  status?: 'DRAFT' | 'COMPLETED';
  clinicalEncounterId?: string;
  patientId?: string;
  nutritionistId?: string;
}) {
  const anamnesisDirectory = new InMemoryAnamnesisDirectory();
  anamnesisDirectory.seed({
    id: ANAMNESIS_ID,
    tenantId: TENANT_ID,
    clinicalEncounterId: options?.clinicalEncounterId ?? ENCOUNTER_ID,
    patientId: options?.patientId ?? PATIENT_ID,
    nutritionistId: options?.nutritionistId ?? NUTRITIONIST_ID,
    status: options?.status ?? 'DRAFT',
    version: 1,
  });
  return anamnesisDirectory;
}

function seedEncounterDirectory(options?: {
  status?: 'OPEN' | 'FINISHED' | 'CANCELLED';
}) {
  const clinicalEncounterDirectory = new InMemoryClinicalEncounterDirectory();
  clinicalEncounterDirectory.seed({
    id: ENCOUNTER_ID,
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    status: options?.status ?? 'OPEN',
  });
  return clinicalEncounterDirectory;
}

function seedPatientDirectory(options?: {
  status?: 'ACTIVE' | 'INACTIVE';
  birthDate?: Date;
}) {
  const patientClinicalDirectory = new InMemoryPatientClinicalDirectory();
  patientClinicalDirectory.seed({
    id: PATIENT_ID,
    tenantId: TENANT_ID,
    status: options?.status ?? 'ACTIVE',
    birthDate: options?.birthDate ?? ADULT_BIRTH_DATE,
  });
  return patientClinicalDirectory;
}

function seedNutritionistDirectory(options?: { status?: 'ACTIVE' | 'INACTIVE' }) {
  const nutritionistDirectory = new InMemoryNutritionistDirectory();
  nutritionistDirectory.seed({
    id: NUTRITIONIST_ID,
    tenantId: TENANT_ID,
    status: options?.status ?? 'ACTIVE',
  });
  return nutritionistDirectory;
}

function createHandler(deps: {
  anthropometricAssessmentRepository?: InMemoryAnthropometricAssessmentRepository;
  tenantDirectory: InMemoryTenantDirectory;
  anamnesisDirectory: InMemoryAnamnesisDirectory;
  clinicalEncounterDirectory: InMemoryClinicalEncounterDirectory;
  patientClinicalDirectory: InMemoryPatientClinicalDirectory;
  nutritionistDirectory?: InMemoryNutritionistDirectory;
  clock?: FixedClock;
  eventDispatcher?: CapturingEventDispatcher;
}) {
  return new RecordAnthropometricAssessmentHandler(
    deps.anthropometricAssessmentRepository
      ?? new InMemoryAnthropometricAssessmentRepository(),
    deps.tenantDirectory,
    deps.anamnesisDirectory,
    deps.clinicalEncounterDirectory,
    deps.patientClinicalDirectory,
    deps.nutritionistDirectory ?? seedNutritionistDirectory(),
    new DefaultBodyMassIndexClassificationPolicy(),
    deps.clock ?? new FixedClock(NOW),
    deps.eventDispatcher ?? noopEventDispatcher,
  );
}

function recordCommand(overrides?: Partial<RecordAnthropometricAssessmentCommand['request']>) {
  return new RecordAnthropometricAssessmentCommand({
    tenantId: TENANT_ID,
    anamnesisId: ANAMNESIS_ID,
    clinicalEncounterId: ENCOUNTER_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    weightKg: '72.50',
    heightCm: '170.00',
    ...overrides,
  });
}

describe('RecordAnthropometricAssessmentHandler', () => {
  it('records anthropometric assessment when preconditions are met', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
    });

    const result = await handler.execute(recordCommand());

    assert.equal(result.tenantId, TENANT_ID);
    assert.equal(result.anamnesisId, ANAMNESIS_ID);
    assert.equal(result.weightKg, '72.50');
    assert.equal(result.heightCm, '170.00');
    assert.equal(result.bodyMassIndex, '25.09');
    assert.equal(result.bodyMassIndexClassification, BodyMassIndexClassification.Overweight);
    assert.equal(result.version, 1);
    assert.equal(result.createdAt, NOW.toISOString());
  });

  it('rejects unknown tenant', async () => {
    const handler = createHandler({
      tenantDirectory: new InMemoryTenantDirectory(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
    });

    await assert.rejects(
      () =>
        handler.execute(
          recordCommand({ tenantId: UNKNOWN_TENANT_ID }),
        ),
      TenantNotFoundForAnthropometryError,
    );
  });

  it('rejects inactive tenant', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant({ status: 'INACTIVE' }),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
    });

    await assert.rejects(
      () => handler.execute(recordCommand()),
      TenantInactiveForAnthropometryError,
    );
  });

  it('rejects missing anamnesis', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      anamnesisDirectory: new InMemoryAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
    });

    await assert.rejects(
      () => handler.execute(recordCommand()),
      AnamnesisNotFoundForAnthropometryError,
    );
  });

  it('rejects completed anamnesis', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory({ status: 'COMPLETED' }),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
    });

    await assert.rejects(
      () => handler.execute(recordCommand()),
      AnamnesisNotDraftForAnthropometryError,
    );
  });

  it('rejects non-open clinical encounter', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory({ status: 'FINISHED' }),
      patientClinicalDirectory: seedPatientDirectory(),
    });

    await assert.rejects(
      () => handler.execute(recordCommand()),
      ClinicalEncounterNotOpenForAnthropometryError,
    );
  });

  it('rejects inactive patient', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory({ status: 'INACTIVE' }),
    });

    await assert.rejects(
      () => handler.execute(recordCommand()),
      PatientInactiveForAnthropometryError,
    );
  });

  it('rejects future measuredAt beyond tolerance', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
      clock: new FixedClock(NOW),
    });

    await assert.rejects(
      () =>
        handler.execute(
          recordCommand({
            measuredAt: new Date('2026-07-17T10:10:00.000Z'),
          }),
        ),
      AnthropometricAssessmentFutureDateError,
    );
  });

  it('rejects measuredAt before birth date', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory({
        birthDate: ADULT_BIRTH_DATE,
      }),
    });

    await assert.rejects(
      () =>
        handler.execute(
          recordCommand({
            measuredAt: new Date('1989-12-31T00:00:00.000Z'),
          }),
        ),
      AnthropometricAssessmentBeforeBirthError,
    );
  });

  it('rejects duplicate sourceRequestId', async () => {
    const repository = new InMemoryAnthropometricAssessmentRepository();
    const calculator = new BodyMassIndexCalculator();
    const weight = BodyWeight.create('72.50');
    const height = BodyHeight.create('170.00');
    const existing = AnthropometricAssessment.create(
      {
        id: AnthropometricAssessmentId.create('550e8400-e29b-41d4-a716-446655440070'),
        tenantId: TENANT_ID,
        anamnesisId: ANAMNESIS_ID,
        clinicalEncounterId: ENCOUNTER_ID,
        patientId: PATIENT_ID,
        nutritionistId: NUTRITIONIST_ID,
        weight,
        height,
        bodyMassIndex: calculator.calculate(weight, height),
        bodyMassIndexClassification: BodyMassIndexClassification.Overweight,
        waistCircumference: null,
        hipCircumference: null,
        abdominalCircumference: null,
        neckCircumference: null,
        armCircumference: null,
        calfCircumference: null,
        waistToHipRatio: null,
        notes: AnthropometricNotes.create(null),
        sourceRequestId: ClinicalSourceRequestId.createOptional('req-duplicate-001'),
        measuredAt: NOW,
      },
      NOW,
    );
    existing.clearDomainEvents();
    await repository.save(existing);

    const handler = createHandler({
      anthropometricAssessmentRepository: repository,
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
    });

    await assert.rejects(
      () =>
        handler.execute(
          recordCommand({ sourceRequestId: 'req-duplicate-001' }),
        ),
      AnthropometricAssessmentDuplicateRequestError,
    );
  });

  it('classifies pediatric patients as PEDIATRIC_NOT_SUPPORTED', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory({
        birthDate: PEDIATRIC_BIRTH_DATE,
      }),
    });

    const result = await handler.execute(recordCommand());

    assert.equal(
      result.bodyMassIndexClassification,
      BodyMassIndexClassification.PediatricNotSupported,
    );
  });

  it('maps domain validation errors to AnthropometricAssessmentValidationError', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
    });

    await assert.rejects(
      () => handler.execute(recordCommand({ weightKg: '0' })),
      AnthropometricAssessmentValidationError,
    );
  });

  it('dispatches AnthropometricAssessmentRecorded after persistence', async () => {
    const eventDispatcher = new CapturingEventDispatcher();
    const repository = new InMemoryAnthropometricAssessmentRepository();
    const handler = createHandler({
      anthropometricAssessmentRepository: repository,
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
      eventDispatcher,
    });

    const result = await handler.execute(recordCommand());

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'AnthropometricAssessmentRecorded',
    );

    const stored = await repository.findByTenantAndId(
      TENANT_ID,
      AnthropometricAssessmentId.create(result.id),
    );
    assert.ok(stored);
  });

  it('does not dispatch events when persistence fails', async () => {
    const eventDispatcher = new CapturingEventDispatcher();
    const failingRepository = new InMemoryAnthropometricAssessmentRepository();
    failingRepository.save = async () => {
      throw new Error('persistence failed');
    };

    const handler = createHandler({
      anthropometricAssessmentRepository: failingRepository,
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
      eventDispatcher,
    });

    await assert.rejects(
      () => handler.execute(recordCommand()),
      /persistence failed/,
    );
    assert.equal(eventDispatcher.dispatched.length, 0);
  });
});
