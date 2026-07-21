import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { InMemoryAnamnesisDirectory } from '../infrastructure/adapters/in-memory-anamnesis-directory.js';
import { InMemoryClinicalEncounterDirectory } from '../infrastructure/adapters/in-memory-clinical-encounter-directory.js';
import { InMemoryNutritionistDirectory } from '../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryPatientClinicalDirectory } from '../infrastructure/adapters/in-memory-patient-clinical-directory.js';
import { InMemoryTenantDirectory } from '../infrastructure/adapters/in-memory-tenant-directory.js';
import {
  buildClinicalObjectiveCreationContext,
} from './clinical-objective-creation-context.js';
import { createClinicalObjectiveCreationContextErrors } from './clinical-objective-creation-context.errors.js';
import { ClinicalEncounterNotOpenForClinicalObjectiveError } from './errors/clinical-encounter-not-open-for-clinical-objective.error.js';
import { ClinicalObjectiveOriginAnamnesisEncounterMismatchError } from './errors/clinical-objective-origin-anamnesis-encounter-mismatch.error.js';
import { PatientInactiveForClinicalObjectiveError } from './errors/patient-inactive-for-clinical-objective.error.js';
import { TenantNotFoundForClinicalObjectiveError } from './errors/tenant-not-found-for-clinical-objective.error.js';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const UNKNOWN_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const OTHER_ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440051';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';

function seedDirectories(options?: {
  tenantStatus?: 'ACTIVE' | 'INACTIVE';
  patientStatus?: 'ACTIVE' | 'INACTIVE';
  encounterStatus?: 'OPEN' | 'FINISHED' | 'CANCELLED';
}) {
  const tenantDirectory = new InMemoryTenantDirectory();
  tenantDirectory.seed({ id: TENANT_ID, status: options?.tenantStatus ?? 'ACTIVE' });

  const patientClinicalDirectory = new InMemoryPatientClinicalDirectory();
  patientClinicalDirectory.seed({
    id: PATIENT_ID,
    tenantId: TENANT_ID,
    status: options?.patientStatus ?? 'ACTIVE',
    birthDate: new Date('1990-01-01T00:00:00.000Z'),
  });

  const nutritionistDirectory = new InMemoryNutritionistDirectory();
  nutritionistDirectory.seed({
    id: CREATED_BY_ID,
    tenantId: TENANT_ID,
    status: 'ACTIVE',
  });
  nutritionistDirectory.seed({
    id: RESPONSIBLE_ID,
    tenantId: TENANT_ID,
    status: 'ACTIVE',
  });

  const clinicalEncounterDirectory = new InMemoryClinicalEncounterDirectory();
  clinicalEncounterDirectory.seed({
    id: ENCOUNTER_ID,
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    nutritionistId: CREATED_BY_ID,
    status: options?.encounterStatus ?? 'OPEN',
  });
  clinicalEncounterDirectory.seed({
    id: OTHER_ENCOUNTER_ID,
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    nutritionistId: CREATED_BY_ID,
    status: 'OPEN',
  });

  const anamnesisDirectory = new InMemoryAnamnesisDirectory();
  anamnesisDirectory.seed({
    id: ANAMNESIS_ID,
    tenantId: TENANT_ID,
    clinicalEncounterId: ENCOUNTER_ID,
    patientId: PATIENT_ID,
    nutritionistId: CREATED_BY_ID,
    status: 'DRAFT',
    version: 1,
  });

  return {
    tenantDirectory,
    patientClinicalDirectory,
    nutritionistDirectory,
    clinicalEncounterDirectory,
    anamnesisDirectory,
  };
}

const errors = createClinicalObjectiveCreationContextErrors();

describe('buildClinicalObjectiveCreationContext', () => {
  it('returns a frozen context when references are valid', async () => {
    const directories = seedDirectories();

    const context = await buildClinicalObjectiveCreationContext({
      ...directories,
      request: {
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
        createdByNutritionistId: CREATED_BY_ID,
        responsibleNutritionistId: RESPONSIBLE_ID,
        originClinicalEncounterId: ENCOUNTER_ID,
        originAnamnesisId: ANAMNESIS_ID,
      },
      errors,
    });

    assert.equal(context.tenant.id, TENANT_ID);
    assert.equal(context.patient.id, PATIENT_ID);
    assert.equal(context.originClinicalEncounter?.id, ENCOUNTER_ID);
    assert.equal(context.originAnamnesis?.id, ANAMNESIS_ID);
    assert.equal(Object.isFrozen(context), true);
    assert.equal(Object.isFrozen(context.tenant), true);
    assert.equal(Object.isFrozen(context.patient), true);
  });

  it('throws when tenant does not exist', async () => {
    const directories = seedDirectories();

    await assert.rejects(
      () =>
        buildClinicalObjectiveCreationContext({
          ...directories,
          request: {
            tenantId: UNKNOWN_TENANT_ID,
            patientId: PATIENT_ID,
            createdByNutritionistId: CREATED_BY_ID,
            responsibleNutritionistId: RESPONSIBLE_ID,
          },
          errors,
        }),
      TenantNotFoundForClinicalObjectiveError,
    );
  });

  it('throws when patient is inactive', async () => {
    const directories = seedDirectories({ patientStatus: 'INACTIVE' });

    await assert.rejects(
      () =>
        buildClinicalObjectiveCreationContext({
          ...directories,
          request: {
            tenantId: TENANT_ID,
            patientId: PATIENT_ID,
            createdByNutritionistId: CREATED_BY_ID,
            responsibleNutritionistId: RESPONSIBLE_ID,
          },
          errors,
        }),
      PatientInactiveForClinicalObjectiveError,
    );
  });

  it('throws when origin encounter is not open', async () => {
    const directories = seedDirectories({ encounterStatus: 'FINISHED' });

    await assert.rejects(
      () =>
        buildClinicalObjectiveCreationContext({
          ...directories,
          request: {
            tenantId: TENANT_ID,
            patientId: PATIENT_ID,
            createdByNutritionistId: CREATED_BY_ID,
            responsibleNutritionistId: RESPONSIBLE_ID,
            originClinicalEncounterId: ENCOUNTER_ID,
          },
          errors,
        }),
      ClinicalEncounterNotOpenForClinicalObjectiveError,
    );
  });

  it('throws when origin anamnesis does not match encounter', async () => {
    const directories = seedDirectories();

    await assert.rejects(
      () =>
        buildClinicalObjectiveCreationContext({
          ...directories,
          request: {
            tenantId: TENANT_ID,
            patientId: PATIENT_ID,
            createdByNutritionistId: CREATED_BY_ID,
            responsibleNutritionistId: RESPONSIBLE_ID,
            originClinicalEncounterId: OTHER_ENCOUNTER_ID,
            originAnamnesisId: ANAMNESIS_ID,
          },
          errors,
        }),
      ClinicalObjectiveOriginAnamnesisEncounterMismatchError,
    );
  });
});
