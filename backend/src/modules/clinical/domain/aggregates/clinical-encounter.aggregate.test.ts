import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { DomainError } from '../errors/domain-error.js';
import {
  ClinicalEncounterCancelled,
  ClinicalEncounterFinished,
  ClinicalEncounterNotesUpdated,
  ClinicalEncounterStarted,
} from '../events/clinical-encounter-events.js';
import { ClinicalEncounterId } from '../value-objects/clinical-encounter-id.js';
import { ClinicalEncounterStatus } from '../value-objects/clinical-encounter-status.js';
import {
  ClinicalEncounterType,
  ClinicalEncounterTypeValue,
} from '../value-objects/clinical-encounter-type.js';
import { ClinicalNotes } from '../value-objects/clinical-notes.js';
import { ClinicalEncounter } from './clinical-encounter.aggregate.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const LATER = new Date('2026-07-17T11:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const APPOINTMENT_ID = '550e8400-e29b-41d4-a716-446655440040';
const ENCOUNTER_ID = ClinicalEncounterId.create(
  '550e8400-e29b-41d4-a716-446655440050',
);

function createEncounter(overrides?: {
  appointmentId?: string | null;
  notes?: ClinicalNotes | null;
}) {
  const clock = new FixedClock(NOW);

  return ClinicalEncounter.create({
    id: ENCOUNTER_ID,
    tenantId: TENANT_ID,
    appointmentId: overrides?.appointmentId ?? null,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    type: ClinicalEncounterType.create(ClinicalEncounterTypeValue.Initial),
    notes: overrides?.notes,
    startedAt: clock.now(),
    now: clock.now(),
  });
}

function reconstituteEncounter(params: {
  status: ClinicalEncounterStatus;
  finishedAt?: Date | null;
}) {
  return ClinicalEncounter.reconstitute({
    id: ENCOUNTER_ID,
    tenantId: TENANT_ID,
    appointmentId: APPOINTMENT_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    type: ClinicalEncounterType.create(ClinicalEncounterTypeValue.FollowUp),
    status: params.status,
    notes: ClinicalNotes.create('Existing notes'),
    startedAt: NOW,
    finishedAt: params.finishedAt ?? null,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

function assertEventPayload(
  event:
    | ClinicalEncounterStarted
    | ClinicalEncounterFinished
    | ClinicalEncounterCancelled
    | ClinicalEncounterNotesUpdated,
  expectedStatus: ClinicalEncounterStatus,
  expectedOccurredAt: Date,
  appointmentId: string | null = null,
) {
  assert.equal(event.aggregateId, ENCOUNTER_ID.toString());
  assert.equal(event.tenantId, TENANT_ID);
  assert.equal(event.patientId, PATIENT_ID);
  assert.equal(event.nutritionistId, NUTRITIONIST_ID);
  assert.equal(event.appointmentId, appointmentId);
  assert.equal(event.status, expectedStatus);
  assert.equal(event.occurredAt.toISOString(), expectedOccurredAt.toISOString());
}

describe('ClinicalEncounter aggregate', () => {
  it('starts encounter with clock, OPEN status, and startedAt from clock', () => {
    const clock = new FixedClock(NOW);
    const encounter = createEncounter();

    assert.equal(encounter.getStatus(), ClinicalEncounterStatus.Open);
    assert.equal(encounter.getStartedAt().toISOString(), NOW.toISOString());
    assert.equal(encounter.getFinishedAt(), null);
    assert.equal(encounter.getCreatedAt().toISOString(), NOW.toISOString());
    assert.equal(encounter.getUpdatedAt().toISOString(), NOW.toISOString());
    assert.ok(clock.now());
  });

  it('publishes ClinicalEncounterStarted on creation', () => {
    const encounter = createEncounter({ appointmentId: APPOINTMENT_ID });
    const event = encounter.domainEvents[0] as ClinicalEncounterStarted;

    assert.equal(encounter.domainEvents.length, 1);
    assert.ok(event instanceof ClinicalEncounterStarted);
    assert.equal(event.eventName, 'ClinicalEncounterStarted');
    assertEventPayload(
      event,
      ClinicalEncounterStatus.Open,
      NOW,
      APPOINTMENT_ID,
    );
  });

  it('finishes OPEN encounter to FINISHED with finishedAt', () => {
    const clock = new FixedClock(LATER);
    const encounter = createEncounter();
    encounter.clearDomainEvents();

    encounter.finish(clock.now());

    assert.equal(encounter.getStatus(), ClinicalEncounterStatus.Finished);
    assert.equal(encounter.getFinishedAt()?.toISOString(), LATER.toISOString());
    assert.equal(encounter.getUpdatedAt().toISOString(), LATER.toISOString());

    const event = encounter.domainEvents[0] as ClinicalEncounterFinished;
    assert.ok(event instanceof ClinicalEncounterFinished);
    assertEventPayload(event, ClinicalEncounterStatus.Finished, LATER);
  });

  it('cancels OPEN encounter to CANCELLED with null finishedAt and clock occurredAt', () => {
    const clock = new FixedClock(LATER);
    const encounter = createEncounter({ appointmentId: APPOINTMENT_ID });
    encounter.clearDomainEvents();

    encounter.cancel(clock.now());

    assert.equal(encounter.getStatus(), ClinicalEncounterStatus.Cancelled);
    assert.equal(encounter.getFinishedAt(), null);
    assert.equal(encounter.getUpdatedAt().toISOString(), LATER.toISOString());

    const event = encounter.domainEvents[0] as ClinicalEncounterCancelled;
    assert.ok(event instanceof ClinicalEncounterCancelled);
    assertEventPayload(
      event,
      ClinicalEncounterStatus.Cancelled,
      LATER,
      APPOINTMENT_ID,
    );
  });

  it('cannot finish a cancelled encounter', () => {
    const clock = new FixedClock(LATER);
    const encounter = reconstituteEncounter({
      status: ClinicalEncounterStatus.Cancelled,
    });

    assert.throws(
      () => encounter.finish(clock.now()),
      /Cannot finish a cancelled clinical encounter/,
    );
  });

  it('cannot cancel a finished encounter', () => {
    const clock = new FixedClock(LATER);
    const encounter = reconstituteEncounter({
      status: ClinicalEncounterStatus.Finished,
      finishedAt: LATER,
    });

    assert.throws(
      () => encounter.cancel(clock.now()),
      /Cannot cancel a finished clinical encounter/,
    );
  });

  it('finish is idempotent when already FINISHED', () => {
    const clock = new FixedClock(LATER);
    const encounter = reconstituteEncounter({
      status: ClinicalEncounterStatus.Finished,
      finishedAt: LATER,
    });

    encounter.finish(clock.now());

    assert.equal(encounter.domainEvents.length, 0);
    assert.equal(encounter.getStatus(), ClinicalEncounterStatus.Finished);
  });

  it('cancel is idempotent when already CANCELLED', () => {
    const clock = new FixedClock(LATER);
    const encounter = reconstituteEncounter({
      status: ClinicalEncounterStatus.Cancelled,
    });

    encounter.cancel(clock.now());

    assert.equal(encounter.domainEvents.length, 0);
    assert.equal(encounter.getStatus(), ClinicalEncounterStatus.Cancelled);
  });

  it('updateNotes only works while OPEN', () => {
    const clock = new FixedClock(LATER);
    const encounter = createEncounter();
    encounter.clearDomainEvents();

    encounter.updateNotes(ClinicalNotes.create('Updated notes'), clock.now());

    assert.equal(encounter.getNotes().toString(), 'Updated notes');
    assert.ok(encounter.domainEvents[0] instanceof ClinicalEncounterNotesUpdated);
  });

  it('updateNotes is idempotent when normalized values are equal', () => {
    const clock = new FixedClock(LATER);
    const encounter = createEncounter({
      notes: ClinicalNotes.create('Same notes'),
    });
    encounter.clearDomainEvents();

    encounter.updateNotes(ClinicalNotes.create('  Same   notes  '), clock.now());

    assert.equal(encounter.domainEvents.length, 0);
    assert.equal(encounter.getNotes().toString(), 'Same notes');
  });

  it('rejects updateNotes when not OPEN', () => {
    const clock = new FixedClock(LATER);
    const encounter = reconstituteEncounter({
      status: ClinicalEncounterStatus.Finished,
      finishedAt: LATER,
    });

    assert.throws(
      () =>
        encounter.updateNotes(ClinicalNotes.create('Late notes'), clock.now()),
      /Cannot update notes clinical encounter in status FINISHED/,
    );
  });

  it('event payloads include aggregateId, tenantId, patientId, nutritionistId, appointmentId, status, occurredAt', () => {
    const clock = new FixedClock(LATER);
    const encounter = createEncounter({ appointmentId: APPOINTMENT_ID });
    encounter.clearDomainEvents();

    encounter.updateNotes(ClinicalNotes.create('Notes'), clock.now());
    const notesEvent = encounter.domainEvents[0] as ClinicalEncounterNotesUpdated;
    assertEventPayload(
      notesEvent,
      ClinicalEncounterStatus.Open,
      LATER,
      APPOINTMENT_ID,
    );

    encounter.clearDomainEvents();
    encounter.finish(clock.now());
    const finishEvent = encounter.domainEvents[0] as ClinicalEncounterFinished;
    assertEventPayload(
      finishEvent,
      ClinicalEncounterStatus.Finished,
      LATER,
      APPOINTMENT_ID,
    );
  });

  it('pullDomainEvents returns and clears pending events', () => {
    const encounter = createEncounter();
    const events = encounter.pullDomainEvents();

    assert.equal(events.length, 1);
    assert.ok(events[0] instanceof ClinicalEncounterStarted);
    assert.equal(encounter.domainEvents.length, 0);
  });

  it('does not import repository layer', () => {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(
      join(currentDir, 'clinical-encounter.aggregate.ts'),
      'utf8',
    );

    assert.doesNotMatch(source, /repository/i);
  });

  it('throws DomainError for invalid state transitions', () => {
    const clock = new FixedClock(LATER);
    const encounter = reconstituteEncounter({
      status: ClinicalEncounterStatus.Cancelled,
    });

    assert.throws(() => encounter.finish(clock.now()), DomainError);
  });
});
