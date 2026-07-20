import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { BodyCompositionAssessment } from '../../domain/aggregates/body-composition-assessment.aggregate.js';
import { BodyCompositionConsistencyPolicy } from '../../domain/policies/body-composition-consistency-policy.js';
import { BodyCompositionAssessmentId } from '../../domain/value-objects/body-composition-assessment-id.js';
import {
  BodyCompositionMeasurementSource,
  BodyCompositionMeasurementSourceValue,
} from '../../domain/value-objects/body-composition-measurement-source.js';
import { BodyCompositionNotes } from '../../domain/value-objects/body-composition-notes.js';
import { BodyFatPercentage } from '../../domain/value-objects/body-fat-percentage.js';
import { ClinicalSourceRequestId } from '../../domain/value-objects/clinical-source-request-id.js';
import { InMemoryAnamnesisDirectory } from '../../infrastructure/adapters/in-memory-anamnesis-directory.js';
import { InMemoryAnthropometricAssessmentDirectory } from '../../infrastructure/adapters/in-memory-anthropometric-assessment-directory.js';
import { InMemoryClinicalEncounterDirectory } from '../../infrastructure/adapters/in-memory-clinical-encounter-directory.js';
import { InMemoryNutritionistDirectory } from '../../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryPatientClinicalDirectory } from '../../infrastructure/adapters/in-memory-patient-clinical-directory.js';
import { InMemoryTenantDirectory } from '../../infrastructure/adapters/in-memory-tenant-directory.js';
import { InMemoryBodyCompositionAssessmentRepository } from '../../infrastructure/repositories/in-memory-body-composition-assessment.repository.js';
import { AnamnesisNotDraftForBodyCompositionError } from '../errors/anamnesis-not-draft-for-body-composition.error.js';
import { AnamnesisNotFoundForBodyCompositionError } from '../errors/anamnesis-not-found-for-body-composition.error.js';
import { AnthropometricAssessmentAnamnesisMismatchForBodyCompositionError } from '../errors/anthropometric-assessment-anamnesis-mismatch-for-body-composition.error.js';
import { AnthropometricAssessmentNotFoundForBodyCompositionError } from '../errors/anthropometric-assessment-not-found-for-body-composition.error.js';
import { BodyCompositionAssessmentBeforeBirthError } from '../errors/body-composition-assessment-before-birth.error.js';
import { BodyCompositionAssessmentDuplicateRequestError } from '../errors/body-composition-assessment-duplicate-request.error.js';
import { BodyCompositionAssessmentFutureDateError } from '../errors/body-composition-assessment-future-date.error.js';
import { BodyCompositionAssessmentValidationError } from '../errors/body-composition-assessment-validation.error.js';
import { ClinicalEncounterNotOpenForBodyCompositionError } from '../errors/clinical-encounter-not-open-for-body-composition.error.js';
import { PatientInactiveForBodyCompositionError } from '../errors/patient-inactive-for-body-composition.error.js';
import { TenantInactiveForBodyCompositionError } from '../errors/tenant-inactive-for-body-composition.error.js';
import { TenantNotFoundForBodyCompositionError } from '../errors/tenant-not-found-for-body-composition.error.js';
import { RecordBodyCompositionAssessmentCommand } from './record-body-composition-assessment.command.js';
import { RecordBodyCompositionAssessmentHandler } from './record-body-composition-assessment.handler.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const ADULT_BIRTH_DATE = new Date('1990-01-01T00:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const UNKNOWN_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';
const ANTHROPOMETRIC_ID = '550e8400-e29b-41d4-a716-446655440070';

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

function seedAnthropometricDirectory(options?: {
  anamnesisId?: string;
  patientId?: string;
  weightKg?: string;
}) {
  const anthropometricAssessmentDirectory = new InMemoryAnthropometricAssessmentDirectory();
  anthropometricAssessmentDirectory.seed({
    id: ANTHROPOMETRIC_ID,
    tenantId: TENANT_ID,
    anamnesisId: options?.anamnesisId ?? ANAMNESIS_ID,
    patientId: options?.patientId ?? PATIENT_ID,
    weightKg: options?.weightKg ?? '72.50',
  });
  return anthropometricAssessmentDirectory;
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
  bodyCompositionAssessmentRepository?: InMemoryBodyCompositionAssessmentRepository;
  tenantDirectory: InMemoryTenantDirectory;
  anamnesisDirectory: InMemoryAnamnesisDirectory;
  clinicalEncounterDirectory: InMemoryClinicalEncounterDirectory;
  patientClinicalDirectory: InMemoryPatientClinicalDirectory;
  nutritionistDirectory?: InMemoryNutritionistDirectory;
  anthropometricAssessmentDirectory?: InMemoryAnthropometricAssessmentDirectory;
  clock?: FixedClock;
  eventDispatcher?: CapturingEventDispatcher;
}) {
  return new RecordBodyCompositionAssessmentHandler(
    deps.bodyCompositionAssessmentRepository
      ?? new InMemoryBodyCompositionAssessmentRepository(),
    deps.tenantDirectory,
    deps.anamnesisDirectory,
    deps.clinicalEncounterDirectory,
    deps.patientClinicalDirectory,
    deps.nutritionistDirectory ?? seedNutritionistDirectory(),
    deps.anthropometricAssessmentDirectory
      ?? seedAnthropometricDirectory(),
    new BodyCompositionConsistencyPolicy(),
    deps.clock ?? new FixedClock(NOW),
    deps.eventDispatcher ?? noopEventDispatcher,
  );
}

function recordCommand(overrides?: Partial<RecordBodyCompositionAssessmentCommand['request']>) {
  return new RecordBodyCompositionAssessmentCommand({
    tenantId: TENANT_ID,
    anamnesisId: ANAMNESIS_ID,
    clinicalEncounterId: ENCOUNTER_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    bodyFatPercentage: '22.50',
    measurementSource: BodyCompositionMeasurementSourceValue.Bioimpedance,
    ...overrides,
  });
}

describe('RecordBodyCompositionAssessmentHandler', () => {
  it('records body composition assessment when preconditions are met', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
    });

    const result = await handler.execute(recordCommand());

    assert.equal(result.tenantId, TENANT_ID);
    assert.equal(result.anamnesisId, ANAMNESIS_ID);
    assert.equal(result.bodyFatPercentage, '22.50');
    assert.equal(result.measurementSource, BodyCompositionMeasurementSourceValue.Bioimpedance);
    assert.equal(result.version, 1);
    assert.equal(result.createdAt, NOW.toISOString());
    assert.equal(typeof result.bodyFatPercentage, 'string');
  });

  it('rejects unknown tenant', async () => {
    const handler = createHandler({
      tenantDirectory: new InMemoryTenantDirectory(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
    });

    await assert.rejects(
      () => handler.execute(recordCommand({ tenantId: UNKNOWN_TENANT_ID })),
      TenantNotFoundForBodyCompositionError,
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
      TenantInactiveForBodyCompositionError,
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
      AnamnesisNotFoundForBodyCompositionError,
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
      AnamnesisNotDraftForBodyCompositionError,
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
      ClinicalEncounterNotOpenForBodyCompositionError,
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
      PatientInactiveForBodyCompositionError,
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
      BodyCompositionAssessmentFutureDateError,
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
      BodyCompositionAssessmentBeforeBirthError,
    );
  });

  it('rejects duplicate sourceRequestId', async () => {
    const repository = new InMemoryBodyCompositionAssessmentRepository();
    const existing = BodyCompositionAssessment.create(
      {
        id: BodyCompositionAssessmentId.create('550e8400-e29b-41d4-a716-446655440080'),
        tenantId: TENANT_ID,
        anamnesisId: ANAMNESIS_ID,
        clinicalEncounterId: ENCOUNTER_ID,
        patientId: PATIENT_ID,
        nutritionistId: NUTRITIONIST_ID,
        anthropometricAssessmentId: null,
        bodyFatPercentage: BodyFatPercentage.create('22.50'),
        leanMass: null,
        fatMass: null,
        muscleMass: null,
        boneMass: null,
        bodyWaterPercentage: null,
        visceralFatLevel: null,
        basalMetabolicRate: null,
        metabolicAge: null,
        notes: BodyCompositionNotes.create(null),
        measurementSource: BodyCompositionMeasurementSource.parse(
          BodyCompositionMeasurementSourceValue.Bioimpedance,
        ),
        sourceRequestId: ClinicalSourceRequestId.createOptional('req-duplicate-001'),
        measuredAt: NOW,
      },
      NOW,
    );
    existing.clearDomainEvents();
    await repository.save(existing);

    const handler = createHandler({
      bodyCompositionAssessmentRepository: repository,
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
    });

    await assert.rejects(
      () => handler.execute(recordCommand({ sourceRequestId: 'req-duplicate-001' })),
      BodyCompositionAssessmentDuplicateRequestError,
    );
  });

  it('maps domain validation errors to BodyCompositionAssessmentValidationError', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
    });

    await assert.rejects(
      () => handler.execute(recordCommand({ bodyFatPercentage: '-1' })),
      BodyCompositionAssessmentValidationError,
    );
  });

  it('validates linked anthropometric assessment context', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
      anthropometricAssessmentDirectory: seedAnthropometricDirectory({
        anamnesisId: '550e8400-e29b-41d4-a716-446655440099',
      }),
    });

    await assert.rejects(
      () =>
        handler.execute(
          recordCommand({ anthropometricAssessmentId: ANTHROPOMETRIC_ID }),
        ),
      AnthropometricAssessmentAnamnesisMismatchForBodyCompositionError,
    );
  });

  it('rejects missing linked anthropometric assessment', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
      anthropometricAssessmentDirectory: new InMemoryAnthropometricAssessmentDirectory(),
    });

    await assert.rejects(
      () =>
        handler.execute(
          recordCommand({ anthropometricAssessmentId: ANTHROPOMETRIC_ID }),
        ),
      AnthropometricAssessmentNotFoundForBodyCompositionError,
    );
  });

  it('records optional integer fields as string integers in result', async () => {
    const handler = createHandler({
      tenantDirectory: seedTenant(),
      anamnesisDirectory: seedAnamnesisDirectory(),
      clinicalEncounterDirectory: seedEncounterDirectory(),
      patientClinicalDirectory: seedPatientDirectory(),
    });

    const result = await handler.execute(
      recordCommand({
        basalMetabolicRate: '1875',
        metabolicAge: '42',
      }),
    );

    assert.equal(result.basalMetabolicRate, '1875');
    assert.equal(result.metabolicAge, '42');
  });

  it('dispatches BodyCompositionRecorded after persistence', async () => {
    const eventDispatcher = new CapturingEventDispatcher();
    const repository = new InMemoryBodyCompositionAssessmentRepository();
    const handler = createHandler({
      bodyCompositionAssessmentRepository: repository,
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
      'BodyCompositionRecorded',
    );

    const stored = await repository.findByTenantAndId(
      TENANT_ID,
      BodyCompositionAssessmentId.create(result.id),
    );
    assert.ok(stored);
  });

  it('does not dispatch events when persistence fails', async () => {
    const eventDispatcher = new CapturingEventDispatcher();
    const failingRepository = new InMemoryBodyCompositionAssessmentRepository();
    failingRepository.save = async () => {
      throw new Error('persistence failed');
    };

    const handler = createHandler({
      bodyCompositionAssessmentRepository: failingRepository,
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
