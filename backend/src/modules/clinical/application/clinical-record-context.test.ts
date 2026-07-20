import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../test-support/fixed-clock.js';
import { InMemoryAnamnesisDirectory } from '../infrastructure/adapters/in-memory-anamnesis-directory.js';
import { InMemoryClinicalEncounterDirectory } from '../infrastructure/adapters/in-memory-clinical-encounter-directory.js';
import { InMemoryNutritionistDirectory } from '../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryPatientClinicalDirectory } from '../infrastructure/adapters/in-memory-patient-clinical-directory.js';
import { InMemoryTenantDirectory } from '../infrastructure/adapters/in-memory-tenant-directory.js';
import { createAnthropometryClinicalRecordContextErrors } from './anthropometry-clinical-record-context.errors.js';
import { buildClinicalRecordContext } from './clinical-record-context.js';
import { ClinicalEncounterNutritionistMismatchError } from './errors/clinical-encounter-nutritionist-mismatch.error.js';
import { ClinicalEncounterPatientMismatchError } from './errors/clinical-encounter-patient-mismatch.error.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const ADULT_BIRTH_DATE = new Date('1990-01-01T00:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';

function seedDirectories(options?: {
  encounterPatientId?: string;
  encounterNutritionistId?: string;
}) {
  const tenantDirectory = new InMemoryTenantDirectory();
  tenantDirectory.seed({ id: TENANT_ID, status: 'ACTIVE' });

  const anamnesisDirectory = new InMemoryAnamnesisDirectory();
  anamnesisDirectory.seed({
    id: ANAMNESIS_ID,
    tenantId: TENANT_ID,
    clinicalEncounterId: ENCOUNTER_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    status: 'DRAFT',
    version: 1,
  });

  const clinicalEncounterDirectory = new InMemoryClinicalEncounterDirectory();
  clinicalEncounterDirectory.seed({
    id: ENCOUNTER_ID,
    tenantId: TENANT_ID,
    patientId: options?.encounterPatientId ?? PATIENT_ID,
    nutritionistId: options?.encounterNutritionistId ?? NUTRITIONIST_ID,
    status: 'OPEN',
  });

  const patientClinicalDirectory = new InMemoryPatientClinicalDirectory();
  patientClinicalDirectory.seed({
    id: PATIENT_ID,
    tenantId: TENANT_ID,
    status: 'ACTIVE',
    birthDate: ADULT_BIRTH_DATE,
  });

  const nutritionistDirectory = new InMemoryNutritionistDirectory();
  nutritionistDirectory.seed({
    id: NUTRITIONIST_ID,
    tenantId: TENANT_ID,
    status: 'ACTIVE',
  });

  return {
    tenantDirectory,
    anamnesisDirectory,
    clinicalEncounterDirectory,
    patientClinicalDirectory,
    nutritionistDirectory,
  };
}

describe('buildClinicalRecordContext', () => {
  it('returns a frozen context with resolved measuredAt', async () => {
    const directories = seedDirectories();
    const measuredAt = new Date('2026-07-17T09:30:00.000Z');

    const context = await buildClinicalRecordContext({
      ...directories,
      clock: new FixedClock(NOW),
      request: {
        tenantId: TENANT_ID,
        anamnesisId: ANAMNESIS_ID,
        clinicalEncounterId: ENCOUNTER_ID,
        patientId: PATIENT_ID,
        nutritionistId: NUTRITIONIST_ID,
        measuredAt,
      },
      errors: createAnthropometryClinicalRecordContextErrors(),
    });

    assert.equal(context.tenant.id, TENANT_ID);
    assert.equal(context.anamnesis.id, ANAMNESIS_ID);
    assert.equal(context.encounter.id, ENCOUNTER_ID);
    assert.equal(context.patient.id, PATIENT_ID);
    assert.equal(context.nutritionist.id, NUTRITIONIST_ID);
    assert.equal(context.measuredAt.toISOString(), measuredAt.toISOString());
    assert.equal(Object.isFrozen(context), true);
  });

  it('throws ClinicalEncounterPatientMismatchError when encounter patient differs', async () => {
    const directories = seedDirectories({
      encounterPatientId: '550e8400-e29b-41d4-a716-446655440099',
    });

    await assert.rejects(
      () =>
        buildClinicalRecordContext({
          ...directories,
          clock: new FixedClock(NOW),
          request: {
            tenantId: TENANT_ID,
            anamnesisId: ANAMNESIS_ID,
            clinicalEncounterId: ENCOUNTER_ID,
            patientId: PATIENT_ID,
            nutritionistId: NUTRITIONIST_ID,
          },
          errors: createAnthropometryClinicalRecordContextErrors(),
        }),
      ClinicalEncounterPatientMismatchError,
    );
  });

  it('throws ClinicalEncounterNutritionistMismatchError when encounter nutritionist differs', async () => {
    const directories = seedDirectories({
      encounterNutritionistId: '550e8400-e29b-41d4-a716-446655440099',
    });

    await assert.rejects(
      () =>
        buildClinicalRecordContext({
          ...directories,
          clock: new FixedClock(NOW),
          request: {
            tenantId: TENANT_ID,
            anamnesisId: ANAMNESIS_ID,
            clinicalEncounterId: ENCOUNTER_ID,
            patientId: PATIENT_ID,
            nutritionistId: NUTRITIONIST_ID,
          },
          errors: createAnthropometryClinicalRecordContextErrors(),
        }),
      ClinicalEncounterNutritionistMismatchError,
    );
  });
});
