import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { DomainError } from '../errors/domain-error.js';
import {
  AppointmentCancelled,
  AppointmentCompleted,
  AppointmentConfirmed,
  AppointmentMarkedNoShow,
  AppointmentNotesUpdated,
  AppointmentRescheduled,
  AppointmentScheduled,
} from '../events/appointment-events.js';
import { AppointmentId } from '../value-objects/appointment-id.js';
import { AppointmentMode, AppointmentModeValue } from '../value-objects/appointment-mode.js';
import { AppointmentNotes } from '../value-objects/appointment-notes.js';
import { AppointmentStatus } from '../value-objects/appointment-status.js';
import { Appointment } from './appointment.aggregate.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const FUTURE_START = new Date('2026-07-18T14:00:00.000Z');
const FUTURE_END_15 = new Date('2026-07-18T14:15:00.000Z');
const FUTURE_END_240 = new Date('2026-07-18T18:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const APPOINTMENT_ID = AppointmentId.create(
  '550e8400-e29b-41d4-a716-446655440040',
);

function createAppointment(overrides?: {
  startsAt?: Date;
  endsAt?: Date;
  mode?: AppointmentMode;
  notes?: AppointmentNotes | null;
}) {
  return Appointment.create({
    id: APPOINTMENT_ID,
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    startsAt: overrides?.startsAt ?? FUTURE_START,
    endsAt: overrides?.endsAt ?? FUTURE_END_15,
    mode: overrides?.mode ?? AppointmentMode.create(AppointmentModeValue.InPerson),
    notes: overrides?.notes,
    now: NOW,
  });
}

describe('Appointment aggregate', () => {
  it('creates a valid appointment with Scheduled status', () => {
    const appointment = createAppointment();

    assert.equal(appointment.getId().toString(), APPOINTMENT_ID.toString());
    assert.equal(appointment.getTenantId(), TENANT_ID);
    assert.equal(appointment.getPatientId(), PATIENT_ID);
    assert.equal(appointment.getNutritionistId(), NUTRITIONIST_ID);
    assert.equal(appointment.getStartsAt().toISOString(), FUTURE_START.toISOString());
    assert.equal(appointment.getEndsAt().toISOString(), FUTURE_END_15.toISOString());
    assert.equal(appointment.getMode().toString(), AppointmentModeValue.InPerson);
    assert.equal(appointment.getStatus(), AppointmentStatus.Scheduled);
    assert.equal(appointment.getNotes().toString(), null);
  });

  it('publishes AppointmentScheduled on creation', () => {
    const appointment = createAppointment();
    const event = appointment.domainEvents[0] as AppointmentScheduled;

    assert.equal(appointment.domainEvents.length, 1);
    assert.ok(event instanceof AppointmentScheduled);
    assert.equal(event.eventName, 'AppointmentScheduled');
    assert.equal(event.aggregateId, APPOINTMENT_ID.toString());
    assert.equal(event.tenantId, TENANT_ID);
    assert.equal(event.patientId, PATIENT_ID);
    assert.equal(event.nutritionistId, NUTRITIONIST_ID);
    assert.equal(event.mode, AppointmentModeValue.InPerson);
    assert.equal(event.startsAt.toISOString(), FUTURE_START.toISOString());
    assert.equal(event.endsAt.toISOString(), FUTURE_END_15.toISOString());
    assert.equal(event.occurredAt.toISOString(), NOW.toISOString());
  });

  it('accepts minimum duration of 15 minutes', () => {
    assert.doesNotThrow(() =>
      createAppointment({ startsAt: FUTURE_START, endsAt: FUTURE_END_15 }),
    );
  });

  it('accepts maximum duration of 240 minutes', () => {
    assert.doesNotThrow(() =>
      createAppointment({ startsAt: FUTURE_START, endsAt: FUTURE_END_240 }),
    );
  });

  it('rejects duration shorter than 15 minutes', () => {
    const tooShortEnd = new Date('2026-07-18T14:14:00.000Z');

    assert.throws(
      () => createAppointment({ startsAt: FUTURE_START, endsAt: tooShortEnd }),
      /Appointment duration must be at least 15 minutes/,
    );
  });

  it('rejects duration longer than 240 minutes', () => {
    const tooLongEnd = new Date('2026-07-18T18:01:00.000Z');

    assert.throws(
      () => createAppointment({ startsAt: FUTURE_START, endsAt: tooLongEnd }),
      /Appointment duration must not exceed 240 minutes/,
    );
  });

  it('rejects start in the past or present', () => {
    assert.throws(
      () =>
        Appointment.create({
          tenantId: TENANT_ID,
          patientId: PATIENT_ID,
          nutritionistId: NUTRITIONIST_ID,
          startsAt: NOW,
          endsAt: FUTURE_END_15,
          mode: AppointmentMode.create(AppointmentModeValue.Online),
          now: NOW,
        }),
      /Appointment start must be in the future/,
    );
  });

  it('runs full lifecycle: confirm, reschedule, update notes, complete', () => {
    const clock = new FixedClock(NOW);
    const appointment = createAppointment();
    appointment.clearDomainEvents();

    appointment.confirm(clock.now());
    assert.equal(appointment.getStatus(), AppointmentStatus.Confirmed);
    assert.ok(appointment.domainEvents[0] instanceof AppointmentConfirmed);

    const newStart = new Date('2026-07-19T10:00:00.000Z');
    const newEnd = new Date('2026-07-19T10:30:00.000Z');
    appointment.clearDomainEvents();
    appointment.reschedule(newStart, newEnd, clock.now());
    assert.equal(appointment.getStartsAt().toISOString(), newStart.toISOString());
    assert.equal(appointment.getEndsAt().toISOString(), newEnd.toISOString());
    assert.ok(appointment.domainEvents[0] instanceof AppointmentRescheduled);

    appointment.clearDomainEvents();
    appointment.updateNotes(AppointmentNotes.create('Bring lab results'), clock.now());
    assert.equal(appointment.getNotes().toString(), 'Bring lab results');
    assert.ok(appointment.domainEvents[0] instanceof AppointmentNotesUpdated);

    appointment.clearDomainEvents();
    appointment.complete(clock.now());
    assert.equal(appointment.getStatus(), AppointmentStatus.Completed);
    assert.ok(appointment.getCompletedAt()?.toISOString(), NOW.toISOString());
    assert.ok(appointment.domainEvents[0] instanceof AppointmentCompleted);
  });

  it('cancels with reason and publishes AppointmentCancelled', () => {
    const clock = new FixedClock(NOW);
    const appointment = createAppointment();
    appointment.clearDomainEvents();

    appointment.cancel('Patient requested cancellation', clock.now());

    assert.equal(appointment.getStatus(), AppointmentStatus.Cancelled);
    assert.equal(appointment.getCancellationReason(), 'Patient requested cancellation');
    assert.equal(appointment.getCancelledAt()?.toISOString(), NOW.toISOString());
    assert.ok(appointment.domainEvents[0] instanceof AppointmentCancelled);
  });

  it('marks no-show and publishes AppointmentMarkedNoShow', () => {
    const clock = new FixedClock(NOW);
    const appointment = createAppointment();
    appointment.clearDomainEvents();

    appointment.markNoShow(clock.now());

    assert.equal(appointment.getStatus(), AppointmentStatus.NoShow);
    assert.ok(appointment.domainEvents[0] instanceof AppointmentMarkedNoShow);
  });

  it('confirm is idempotent', () => {
    const clock = new FixedClock(NOW);
    const appointment = createAppointment();
    appointment.confirm(clock.now());
    appointment.clearDomainEvents();

    appointment.confirm(clock.now());

    assert.equal(appointment.domainEvents.length, 0);
    assert.equal(appointment.getStatus(), AppointmentStatus.Confirmed);
  });

  it('cancel is idempotent', () => {
    const clock = new FixedClock(NOW);
    const appointment = createAppointment();
    appointment.cancel('First reason', clock.now());
    appointment.clearDomainEvents();

    appointment.cancel('Second reason', clock.now());

    assert.equal(appointment.domainEvents.length, 0);
    assert.equal(appointment.getCancellationReason(), 'First reason');
  });

  it('complete is idempotent', () => {
    const clock = new FixedClock(NOW);
    const appointment = createAppointment();
    appointment.complete(clock.now());
    appointment.clearDomainEvents();

    appointment.complete(clock.now());

    assert.equal(appointment.domainEvents.length, 0);
    assert.equal(appointment.getStatus(), AppointmentStatus.Completed);
  });

  it('markNoShow is idempotent', () => {
    const clock = new FixedClock(NOW);
    const appointment = createAppointment();
    appointment.markNoShow(clock.now());
    appointment.clearDomainEvents();

    appointment.markNoShow(clock.now());

    assert.equal(appointment.domainEvents.length, 0);
    assert.equal(appointment.getStatus(), AppointmentStatus.NoShow);
  });

  it('updateNotes is idempotent when notes are unchanged', () => {
    const clock = new FixedClock(NOW);
    const notes = AppointmentNotes.create('Same notes');
    const appointment = createAppointment({ notes });
    appointment.clearDomainEvents();

    appointment.updateNotes(notes, clock.now());

    assert.equal(appointment.domainEvents.length, 0);
  });

  it('rejects cancel without reason', () => {
    const clock = new FixedClock(NOW);
    const appointment = createAppointment();

    assert.throws(() => appointment.cancel('   ', clock.now()), DomainError);
  });

  it('rejects reschedule when cancelled', () => {
    const clock = new FixedClock(NOW);
    const appointment = createAppointment();
    appointment.cancel('Cancelled', clock.now());

    assert.throws(
      () =>
        appointment.reschedule(
          new Date('2026-07-19T10:00:00.000Z'),
          new Date('2026-07-19T10:15:00.000Z'),
          clock.now(),
        ),
      /Cannot reschedule appointment in status CANCELLED/,
    );
  });

  it('rejects updateNotes when completed', () => {
    const clock = new FixedClock(NOW);
    const appointment = createAppointment();
    appointment.complete(clock.now());

    assert.throws(
      () => appointment.updateNotes(AppointmentNotes.create('Late notes'), clock.now()),
      /Completed appointments cannot update notes/,
    );
  });

  it('pullDomainEvents returns and clears pending events', () => {
    const appointment = createAppointment();
    const events = appointment.pullDomainEvents();

    assert.equal(events.length, 1);
    assert.ok(events[0] instanceof AppointmentScheduled);
    assert.equal(appointment.domainEvents.length, 0);
  });

  it('supports ONLINE mode', () => {
    const appointment = createAppointment({
      mode: AppointmentMode.create(AppointmentModeValue.Online),
    });

    assert.equal(appointment.getMode().toString(), AppointmentModeValue.Online);
  });
});
