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
import { InMemoryClinicalEncounterRepository } from './in-memory-clinical-encounter.repository.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const OTHER_PATIENT_ID = '550e8400-e29b-41d4-a716-446655440021';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const OTHER_NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440031';
const APPOINTMENT_ID = '550e8400-e29b-41d4-a716-446655440040';
const OTHER_APPOINTMENT_ID = '550e8400-e29b-41d4-a716-446655440041';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const OTHER_ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440051';
const FINISHED_ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440052';

function createEncounter(params: {
  id: string;
  patientId?: string;
  nutritionistId?: string;
  appointmentId?: string | null;
  status?: ClinicalEncounterStatus;
}) {
  return ClinicalEncounter.reconstitute({
    id: ClinicalEncounterId.create(params.id),
    tenantId: TENANT_ID,
    appointmentId: params.appointmentId ?? null,
    patientId: params.patientId ?? PATIENT_ID,
    nutritionistId: params.nutritionistId ?? NUTRITIONIST_ID,
    type: ClinicalEncounterType.create(ClinicalEncounterTypeValue.Initial),
    status: params.status ?? ClinicalEncounterStatus.Open,
    notes: ClinicalNotes.create(null),
    startedAt: NOW,
    finishedAt:
      params.status === ClinicalEncounterStatus.Finished ? NOW : null,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

describe('InMemoryClinicalEncounterRepository', () => {
  it('finds encounter by tenant and id', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    const encounter = createEncounter({ id: ENCOUNTER_ID });
    await repository.save(encounter);

    const found = await repository.findByTenantAndId(
      TENANT_ID,
      ClinicalEncounterId.create(ENCOUNTER_ID),
    );

    assert.ok(found);
    assert.equal(found.getId().toString(), ENCOUNTER_ID);
    assert.equal(found.getTenantId(), TENANT_ID);
  });

  it('returns null for wrong tenant in findByTenantAndId', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await repository.save(createEncounter({ id: ENCOUNTER_ID }));

    const found = await repository.findByTenantAndId(
      '550e8400-e29b-41d4-a716-446655440099',
      ClinicalEncounterId.create(ENCOUNTER_ID),
    );

    assert.equal(found, null);
  });

  it('finds encounter by appointment', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await repository.save(
      createEncounter({ id: ENCOUNTER_ID, appointmentId: APPOINTMENT_ID }),
    );

    const found = await repository.findByAppointment(TENANT_ID, APPOINTMENT_ID);

    assert.ok(found);
    assert.equal(found.getAppointmentId(), APPOINTMENT_ID);
  });

  it('finds encounters by patient', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await repository.save(createEncounter({ id: ENCOUNTER_ID, patientId: PATIENT_ID }));
    await repository.save(
      createEncounter({
        id: OTHER_ENCOUNTER_ID,
        patientId: OTHER_PATIENT_ID,
      }),
    );

    const found = await repository.findByPatient(TENANT_ID, PATIENT_ID);

    assert.equal(found.length, 1);
    assert.equal(found[0]?.getPatientId(), PATIENT_ID);
  });

  it('finds encounters by nutritionist', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await repository.save(
      createEncounter({ id: ENCOUNTER_ID, nutritionistId: NUTRITIONIST_ID }),
    );
    await repository.save(
      createEncounter({
        id: OTHER_ENCOUNTER_ID,
        nutritionistId: OTHER_NUTRITIONIST_ID,
      }),
    );

    const found = await repository.findByNutritionist(
      TENANT_ID,
      NUTRITIONIST_ID,
    );

    assert.equal(found.length, 1);
    assert.equal(found[0]?.getNutritionistId(), NUTRITIONIST_ID);
  });

  it('finds open encounter for patient and nutritionist pair', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await repository.save(
      createEncounter({
        id: ENCOUNTER_ID,
        status: ClinicalEncounterStatus.Open,
      }),
    );
    await repository.save(
      createEncounter({
        id: FINISHED_ENCOUNTER_ID,
        status: ClinicalEncounterStatus.Finished,
        appointmentId: OTHER_APPOINTMENT_ID,
      }),
    );

    const found = await repository.findOpenEncounter(
      TENANT_ID,
      PATIENT_ID,
      NUTRITIONIST_ID,
    );

    assert.ok(found);
    assert.equal(found.getId().toString(), ENCOUNTER_ID);
    assert.equal(found.getStatus(), ClinicalEncounterStatus.Open);
  });

  it('returns null when no open encounter exists for pair', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await repository.save(
      createEncounter({
        id: FINISHED_ENCOUNTER_ID,
        status: ClinicalEncounterStatus.Finished,
        appointmentId: APPOINTMENT_ID,
      }),
    );

    const found = await repository.findOpenEncounter(
      TENANT_ID,
      PATIENT_ID,
      NUTRITIONIST_ID,
    );

    assert.equal(found, null);
  });
});
