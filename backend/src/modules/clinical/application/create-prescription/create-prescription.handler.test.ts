import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { InMemoryAnamnesisDirectory } from '../../infrastructure/adapters/in-memory-anamnesis-directory.js';
import { InMemoryClinicalEncounterDirectory } from '../../infrastructure/adapters/in-memory-clinical-encounter-directory.js';
import { InMemoryNutritionistDirectory } from '../../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryPatientClinicalDirectory } from '../../infrastructure/adapters/in-memory-patient-clinical-directory.js';
import { InMemoryTenantDirectory } from '../../infrastructure/adapters/in-memory-tenant-directory.js';
import { InMemoryPrescriptionRepository } from '../../infrastructure/repositories/in-memory-prescription.repository.js';
import { PrescriptionStatusValue } from '../../domain/value-objects/prescription-status.js';
import { TenantNotFoundForPrescriptionError } from '../errors/tenant-not-found-for-prescription.error.js';
import { CreatePrescriptionCommand } from './create-prescription.command.js';
import { CreatePrescriptionHandler } from './create-prescription.handler.js';

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

describe('CreatePrescriptionHandler', () => {
  it('creates a draft prescription', async () => {
    const repository = new InMemoryPrescriptionRepository();
    const directories = seedDirectories();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new CreatePrescriptionHandler(
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
      new CreatePrescriptionCommand({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
        createdByNutritionistId: CREATED_BY_ID,
        responsibleNutritionistId: RESPONSIBLE_ID,
        originClinicalEncounterId: ENCOUNTER_ID,
        originAnamnesisId: ANAMNESIS_ID,
        title: 'Supplementation protocol',
        clinicalNotes: 'Monitor tolerance weekly.',
        lines: [
          {
            sortOrder: 1,
            description: 'Vitamin D3',
            doseQuantity: '2000',
            doseUnit: 'IU',
            frequencyDisplayText: 'Once daily with breakfast',
          },
        ],
      }),
    );

    assert.equal(result.status, PrescriptionStatusValue.Draft);
    assert.equal(result.patientId, PATIENT_ID);
    assert.equal(result.originClinicalEncounterId, ENCOUNTER_ID);
    assert.equal(result.originAnamnesisId, ANAMNESIS_ID);
    assert.equal(result.lines.length, 1);
    assert.equal(result.lines[0]?.description, 'Vitamin D3');
    assert.equal(eventDispatcher.dispatched.length, 1);
  });

  it('throws when tenant does not exist', async () => {
    const directories = seedDirectories();
    const handler = new CreatePrescriptionHandler(
      new InMemoryPrescriptionRepository(),
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
          new CreatePrescriptionCommand({
            tenantId: UNKNOWN_TENANT_ID,
            patientId: PATIENT_ID,
            createdByNutritionistId: CREATED_BY_ID,
            responsibleNutritionistId: RESPONSIBLE_ID,
          }),
        ),
      TenantNotFoundForPrescriptionError,
    );
  });
});
