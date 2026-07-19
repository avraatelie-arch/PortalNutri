import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { ClinicalEncounter } from '../../domain/aggregates/clinical-encounter.aggregate.js';
import { ClinicalEncounterId } from '../../domain/value-objects/clinical-encounter-id.js';
import { ClinicalEncounterStatus } from '../../domain/value-objects/clinical-encounter-status.js';
import {
  ClinicalEncounterType,
  ClinicalEncounterTypeValue,
} from '../../domain/value-objects/clinical-encounter-type.js';
import { ClinicalNotes } from '../../domain/value-objects/clinical-notes.js';
import { InMemoryClinicalEncounterRepository } from '../../infrastructure/repositories/in-memory-clinical-encounter.repository.js';
import { ClinicalEncounterValidationError } from '../errors/clinical-encounter-validation.error.js';
import { UpdateClinicalNotesCommand } from './update-clinical-notes.command.js';
import { UpdateClinicalNotesHandler } from './update-clinical-notes.handler.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const LATER = new Date('2026-07-17T11:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';

async function seedEncounter(
  repository: InMemoryClinicalEncounterRepository,
  options?: {
    status?: ClinicalEncounterStatus;
    notes?: string | null;
  },
) {
  const encounter = ClinicalEncounter.reconstitute({
    id: ClinicalEncounterId.create(ENCOUNTER_ID),
    tenantId: TENANT_ID,
    appointmentId: null,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    type: ClinicalEncounterType.create(ClinicalEncounterTypeValue.Initial),
    status: options?.status ?? ClinicalEncounterStatus.Open,
    notes: ClinicalNotes.create(options?.notes ?? null),
    startedAt: NOW,
    finishedAt:
      options?.status === ClinicalEncounterStatus.Finished ? LATER : null,
    createdAt: NOW,
    updatedAt: NOW,
  });

  await repository.save(encounter);
  return encounter;
}

describe('UpdateClinicalNotesHandler', () => {
  it('updates notes while encounter is OPEN', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await seedEncounter(repository);
    const handler = new UpdateClinicalNotesHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new UpdateClinicalNotesCommand({
        tenantId: TENANT_ID,
        encounterId: ENCOUNTER_ID,
        notes: 'Updated clinical notes',
      }),
    );

    assert.equal(result.notes, 'Updated clinical notes');
    assert.equal(result.status, ClinicalEncounterStatus.Open);
  });

  it('does not dispatch event when normalized notes are unchanged', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await seedEncounter(repository, { notes: 'Same notes' });
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new UpdateClinicalNotesHandler(
      repository,
      new FixedClock(LATER),
      eventDispatcher,
    );

    await handler.execute(
      new UpdateClinicalNotesCommand({
        tenantId: TENANT_ID,
        encounterId: ENCOUNTER_ID,
        notes: '  Same   notes  ',
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 0);
  });

  it('dispatches ClinicalEncounterNotesUpdated when notes change', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await seedEncounter(repository);
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new UpdateClinicalNotesHandler(
      repository,
      new FixedClock(LATER),
      eventDispatcher,
    );

    await handler.execute(
      new UpdateClinicalNotesCommand({
        tenantId: TENANT_ID,
        encounterId: ENCOUNTER_ID,
        notes: 'New notes',
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'ClinicalEncounterNotesUpdated',
    );
  });

  it('rejects updating notes on finished encounter', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await seedEncounter(repository, { status: ClinicalEncounterStatus.Finished });
    const handler = new UpdateClinicalNotesHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new UpdateClinicalNotesCommand({
            tenantId: TENANT_ID,
            encounterId: ENCOUNTER_ID,
            notes: 'Too late',
          }),
        ),
      ClinicalEncounterValidationError,
    );
  });

  it('rejects updating notes on cancelled encounter', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await seedEncounter(repository, {
      status: ClinicalEncounterStatus.Cancelled,
    });
    const handler = new UpdateClinicalNotesHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new UpdateClinicalNotesCommand({
            tenantId: TENANT_ID,
            encounterId: ENCOUNTER_ID,
            notes: 'Too late',
          }),
        ),
      ClinicalEncounterValidationError,
    );
  });
});
