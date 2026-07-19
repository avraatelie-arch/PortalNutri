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
import { FinishClinicalEncounterCommand } from './finish-clinical-encounter.command.js';
import { FinishClinicalEncounterHandler } from './finish-clinical-encounter.handler.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const LATER = new Date('2026-07-17T11:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';

async function seedOpenEncounter(
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
    finishedAt:
      status === ClinicalEncounterStatus.Finished ? NOW : null,
    createdAt: NOW,
    updatedAt: NOW,
  });

  await repository.save(encounter);
  return encounter;
}

describe('FinishClinicalEncounterHandler', () => {
  it('finishes an OPEN encounter', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await seedOpenEncounter(repository);
    const handler = new FinishClinicalEncounterHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new FinishClinicalEncounterCommand({
        tenantId: TENANT_ID,
        encounterId: ENCOUNTER_ID,
      }),
    );

    assert.equal(result.status, ClinicalEncounterStatus.Finished);
    assert.equal(result.finishedAt, LATER.toISOString());
  });

  it('is idempotent when encounter is already FINISHED', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await seedOpenEncounter(repository, ClinicalEncounterStatus.Finished);
    const eventDispatcher = new CapturingEventDispatcher();
    let saveCalls = 0;

    const originalSave = repository.save.bind(repository);
    repository.save = async (encounter) => {
      saveCalls += 1;
      return originalSave(encounter);
    };

    const handler = new FinishClinicalEncounterHandler(
      repository,
      new FixedClock(LATER),
      eventDispatcher,
    );

    const result = await handler.execute(
      new FinishClinicalEncounterCommand({
        tenantId: TENANT_ID,
        encounterId: ENCOUNTER_ID,
      }),
    );

    assert.equal(result.status, ClinicalEncounterStatus.Finished);
    assert.equal(saveCalls, 0);
    assert.equal(eventDispatcher.dispatched.length, 0);
  });

  it('throws ClinicalEncounterNotFoundError for wrong tenant', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await seedOpenEncounter(repository);
    const handler = new FinishClinicalEncounterHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new FinishClinicalEncounterCommand({
            tenantId: OTHER_TENANT_ID,
            encounterId: ENCOUNTER_ID,
          }),
        ),
      ClinicalEncounterNotFoundError,
    );
  });

  it('dispatches ClinicalEncounterFinished when status changes', async () => {
    const repository = new InMemoryClinicalEncounterRepository();
    await seedOpenEncounter(repository);
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new FinishClinicalEncounterHandler(
      repository,
      new FixedClock(LATER),
      eventDispatcher,
    );

    await handler.execute(
      new FinishClinicalEncounterCommand({
        tenantId: TENANT_ID,
        encounterId: ENCOUNTER_ID,
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'ClinicalEncounterFinished',
    );
  });
});
