import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { InMemoryAnamnesisDirectory } from '../../infrastructure/adapters/in-memory-anamnesis-directory.js';
import { InMemoryClinicalEncounterDirectory } from '../../infrastructure/adapters/in-memory-clinical-encounter-directory.js';
import { InMemoryNutritionistDirectory } from '../../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryPatientClinicalDirectory } from '../../infrastructure/adapters/in-memory-patient-clinical-directory.js';
import { InMemoryTenantDirectory } from '../../infrastructure/adapters/in-memory-tenant-directory.js';
import { InMemoryNutritionDiagnosisRepository } from '../../infrastructure/repositories/in-memory-nutrition-diagnosis.repository.js';
import { NutritionDiagnosisStatusValue } from '../../domain/value-objects/nutrition-diagnosis-status.js';
import { TenantNotFoundForNutritionDiagnosisError } from '../errors/tenant-not-found-for-nutrition-diagnosis.error.js';
import { CreateNutritionDiagnosisCommand } from './create-nutrition-diagnosis.command.js';
import { CreateNutritionDiagnosisHandler } from './create-nutrition-diagnosis.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const UNKNOWN_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';

function seedDirectories() {
  const tenantDirectory = new InMemoryTenantDirectory();
  tenantDirectory.seed({ id: TENANT_ID, status: 'ACTIVE' });
  const patientClinicalDirectory = new InMemoryPatientClinicalDirectory();
  patientClinicalDirectory.seed({
    id: PATIENT_ID,
    tenantId: TENANT_ID,
    status: 'ACTIVE',
    birthDate: new Date('1990-01-01T00:00:00.000Z'),
  });
  const nutritionistDirectory = new InMemoryNutritionistDirectory();
  nutritionistDirectory.seed({ id: CREATED_BY_ID, tenantId: TENANT_ID, status: 'ACTIVE' });
  nutritionistDirectory.seed({ id: RESPONSIBLE_ID, tenantId: TENANT_ID, status: 'ACTIVE' });
  const clinicalEncounterDirectory = new InMemoryClinicalEncounterDirectory();
  clinicalEncounterDirectory.seed({
    id: ENCOUNTER_ID,
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

describe('CreateNutritionDiagnosisHandler', () => {
  it('creates a draft nutrition diagnosis', async () => {
    const repository = new InMemoryNutritionDiagnosisRepository();
    const directories = seedDirectories();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new CreateNutritionDiagnosisHandler(
      repository,
      directories.tenantDirectory,
      directories.patientClinicalDirectory,
      directories.nutritionistDirectory,
      directories.clinicalEncounterDirectory,
      directories.anamnesisDirectory,
      new FixedClock(NOW),
      eventDispatcher,
    );

    const result = await handler.execute(
      new CreateNutritionDiagnosisCommand({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
        createdByNutritionistId: CREATED_BY_ID,
        responsibleNutritionistId: RESPONSIBLE_ID,
        originClinicalEncounterId: ENCOUNTER_ID,
        originAnamnesisId: ANAMNESIS_ID,
        problemCategory: 'ENERGY_BALANCE',
      }),
    );

    assert.equal(result.status, NutritionDiagnosisStatusValue.Draft);
    assert.equal(result.patientId, PATIENT_ID);
    assert.equal(result.problemCategory, 'ENERGY_BALANCE');
    assert.equal(result.originClinicalEncounterId, ENCOUNTER_ID);
    assert.equal(eventDispatcher.dispatched.length, 1);
  });

  it('throws when tenant does not exist', async () => {
    const directories = seedDirectories();
    const handler = new CreateNutritionDiagnosisHandler(
      new InMemoryNutritionDiagnosisRepository(),
      directories.tenantDirectory,
      directories.patientClinicalDirectory,
      directories.nutritionistDirectory,
      directories.clinicalEncounterDirectory,
      directories.anamnesisDirectory,
      new FixedClock(NOW),
      new CapturingEventDispatcher(),
    );

    await assert.rejects(
      () =>
        handler.execute(
          new CreateNutritionDiagnosisCommand({
            tenantId: UNKNOWN_TENANT_ID,
            patientId: PATIENT_ID,
            createdByNutritionistId: CREATED_BY_ID,
            responsibleNutritionistId: RESPONSIBLE_ID,
          }),
        ),
      TenantNotFoundForNutritionDiagnosisError,
    );
  });
});
