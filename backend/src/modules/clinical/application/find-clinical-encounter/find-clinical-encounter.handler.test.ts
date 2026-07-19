import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ClinicalEncounter } from '../../domain/aggregates/clinical-encounter.aggregate.js';
import { ClinicalEncounterId } from '../../domain/value-objects/clinical-encounter-id.js';
import { ClinicalEncounterStatus } from '../../domain/value-objects/clinical-encounter-status.js';
import {
  ClinicalEncounterType,
  ClinicalEncounterTypeValue,
} from '../../domain/value-objects/clinical-encounter-type.js';
import { ClinicalNotes } from '../../domain/value-objects/clinical-notes.js';
import { InMemoryClinicalEncounterRepository } from '../../infrastructure/repositories/in-memory-clinical-encounter.repository.js';
import { ClinicalEncounterNotFoundError } from '../errors/clinical-encounter-not-found.error.js';
import { FindClinicalEncounterHandler } from './find-clinical-encounter.handler.js';
import { FindClinicalEncounterQuery } from './find-clinical-encounter.query.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const APPOINTMENT_ID = '550e8400-e29b-41d4-a716-446655440040';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';

async function seedEncounter(
  repository: InMemoryClinicalEncounterRepository,
  overrides?: {
    id?: string;
    tenantId?: string;
    patientId?: string;
    nutritionistId?: string;
    appointmentId?: string | null;
    status?: ClinicalEncounterStatus;
  },
) {
  const encounter = ClinicalEncounter.reconstitute({
    id: ClinicalEncounterId.create(overrides?.id ?? ENCOUNTER_ID),
    tenantId: overrides?.tenantId ?? TENANT_ID,
    appointmentId: overrides?.appointmentId ?? APPOINTMENT_ID,
    patientId: overrides?.patientId ?? PATIENT_ID,
    nutritionistId: overrides?.nutritionistId ?? NUTRITIONIST_ID,
    type: ClinicalEncounterType.create(ClinicalEncounterTypeValue.Initial),
    status: overrides?.status ?? ClinicalEncounterStatus.Open,
    notes: ClinicalNotes.create('Stored notes'),
    startedAt: NOW,
    finishedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  });

  await repository.save(encounter);
  return encounter;
}

describe('FindClinicalEncounterHandler', () => {
  it('finds an encounter scoped to tenant', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await seedEncounter(repository);
    const handler = new FindClinicalEncounterHandler(repository);

    const found = await handler.execute(
      new FindClinicalEncounterQuery({
        tenantId: TENANT_ID,
        encounterId: ENCOUNTER_ID,
      }),
    );

    assert.equal(found.id, ENCOUNTER_ID);
    assert.equal(found.tenantId, TENANT_ID);
    assert.equal(found.patientId, PATIENT_ID);
    assert.equal(found.nutritionistId, NUTRITIONIST_ID);
    assert.equal(found.appointmentId, APPOINTMENT_ID);
    assert.equal(found.notes, 'Stored notes');
    assert.equal(found.startedAt, NOW.toISOString());
  });

  it('throws ClinicalEncounterNotFoundError for wrong tenant', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await seedEncounter(repository);
    const handler = new FindClinicalEncounterHandler(repository);

    await assert.rejects(
      () =>
        handler.execute(
          new FindClinicalEncounterQuery({
            tenantId: OTHER_TENANT_ID,
            encounterId: ENCOUNTER_ID,
          }),
        ),
      ClinicalEncounterNotFoundError,
    );
  });

  it('throws ClinicalEncounterNotFoundError when encounter does not exist', async () => {
    const handler = new FindClinicalEncounterHandler(
      new InMemoryClinicalEncounterRepository(),
    );

    await assert.rejects(
      () =>
        handler.execute(
          new FindClinicalEncounterQuery({
            tenantId: TENANT_ID,
            encounterId: '550e8400-e29b-41d4-a716-446655440088',
          }),
        ),
      ClinicalEncounterNotFoundError,
    );
  });
});
