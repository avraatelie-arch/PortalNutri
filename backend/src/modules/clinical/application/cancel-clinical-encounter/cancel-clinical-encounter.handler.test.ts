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
import { ClinicalEncounterNotFoundError } from '../errors/clinical-encounter-not-found.error.js';
import { CancelClinicalEncounterCommand } from './cancel-clinical-encounter.command.js';
import { CancelClinicalEncounterHandler } from './cancel-clinical-encounter.handler.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const LATER = new Date('2026-07-17T11:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';

async function seedEncounter(
  repository: InMemoryClinicalEncounterRepository,
  status: ClinicalEncounterStatus = ClinicalEncounterStatus.Open,
) {
  const encounter = ClinicalEncounter.reconstitute({
    id: ClinicalEncounterId.create(ENCOUNTER_ID),
    tenantId: TENANT_ID,
    appointmentId: null,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    type: ClinicalEncounterType.create(ClinicalEncounterTypeValue.Initial),
    status,
    notes: ClinicalNotes.create(null),
    startedAt: NOW,
    finishedAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  });

  await repository.save(encounter);
  return encounter;
}

describe('CancelClinicalEncounterHandler', () => {
  it('cancels an OPEN encounter with null finishedAt in result', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await seedEncounter(repository);
    const handler = new CancelClinicalEncounterHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new CancelClinicalEncounterCommand({
        tenantId: TENANT_ID,
        encounterId: ENCOUNTER_ID,
      }),
    );

    assert.equal(result.status, ClinicalEncounterStatus.Cancelled);
    assert.equal(result.finishedAt, null);
  });

  it('is idempotent when encounter is already CANCELLED', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await seedEncounter(repository, ClinicalEncounterStatus.Cancelled);
    const eventDispatcher = new CapturingEventDispatcher();
    let saveCalls = 0;

    const originalSave = repository.save.bind(repository);
    repository.save = async (encounter) => {
      saveCalls += 1;
      return originalSave(encounter);
    };

    const handler = new CancelClinicalEncounterHandler(
      repository,
      new FixedClock(LATER),
      eventDispatcher,
    );

    const result = await handler.execute(
      new CancelClinicalEncounterCommand({
        tenantId: TENANT_ID,
        encounterId: ENCOUNTER_ID,
      }),
    );

    assert.equal(result.status, ClinicalEncounterStatus.Cancelled);
    assert.equal(result.finishedAt, null);
    assert.equal(saveCalls, 0);
    assert.equal(eventDispatcher.dispatched.length, 0);
  });

  it('uses clock for cancellation event timestamp and keeps finishedAt null', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await seedEncounter(repository);
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new CancelClinicalEncounterHandler(
      repository,
      new FixedClock(LATER),
      eventDispatcher,
    );

    const result = await handler.execute(
      new CancelClinicalEncounterCommand({
        tenantId: TENANT_ID,
        encounterId: ENCOUNTER_ID,
      }),
    );

    assert.equal(result.finishedAt, null);
    assert.equal(eventDispatcher.dispatched.length, 1);

    const event = eventDispatcher.dispatched[0]?.[0] as {
      eventName: string;
      occurredAt: Date;
    };
    assert.equal(event.eventName, 'ClinicalEncounterCancelled');
    assert.equal(event.occurredAt.toISOString(), LATER.toISOString());
  });

  it('throws ClinicalEncounterNotFoundError for wrong tenant', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await seedEncounter(repository);
    const handler = new CancelClinicalEncounterHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new CancelClinicalEncounterCommand({
            tenantId: OTHER_TENANT_ID,
            encounterId: ENCOUNTER_ID,
          }),
        ),
      ClinicalEncounterNotFoundError,
    );
  });
});
