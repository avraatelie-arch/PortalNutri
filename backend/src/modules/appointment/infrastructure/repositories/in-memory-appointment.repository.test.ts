import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Appointment } from '../../domain/aggregates/appointment.aggregate.js';
import { AppointmentId } from '../../domain/value-objects/appointment-id.js';
import { AppointmentMode, AppointmentModeValue } from '../../domain/value-objects/appointment-mode.js';
import { AppointmentNotes } from '../../domain/value-objects/appointment-notes.js';
import { AppointmentStatus } from '../../domain/value-objects/appointment-status.js';
import { InMemoryAppointmentRepository } from './in-memory-appointment.repository.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';

function createStoredAppointment(params: {
  id: string;
  startsAt: Date;
  endsAt: Date;
  status?: AppointmentStatus;
  patientId?: string;
}) {
  const appointment = Appointment.create({
    id: AppointmentId.create(params.id),
    tenantId: TENANT_ID,
    patientId: params.patientId ?? PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    startsAt: params.startsAt,
    endsAt: params.endsAt,
    mode: AppointmentMode.create(AppointmentModeValue.InPerson),
    notes: AppointmentNotes.create(null),
    now: NOW,
  });

  if (params.status === AppointmentStatus.Confirmed) {
    appointment.confirm(NOW);
  }

  if (params.status === AppointmentStatus.Cancelled) {
    appointment.cancel('Cancelled for test', NOW);
  }

  appointment.clearDomainEvents();
  return appointment;
}

describe('InMemoryAppointmentRepository overlap logic', () => {
  it('returns no overlap for adjacent appointments', async () => {
    const repository = new InMemoryAppointmentRepository();
    const firstStart = new Date('2026-07-18T14:00:00.000Z');
    const firstEnd = new Date('2026-07-18T14:15:00.000Z');
    const secondStart = new Date('2026-07-18T14:15:00.000Z');
    const secondEnd = new Date('2026-07-18T14:30:00.000Z');

    await repository.save(
      createStoredAppointment({
        id: '550e8400-e29b-41d4-a716-446655440041',
        startsAt: firstStart,
        endsAt: firstEnd,
      }),
    );

    const overlaps = await repository.findOverlappingForNutritionist({
      tenantId: TENANT_ID,
      nutritionistId: NUTRITIONIST_ID,
      startsAt: secondStart,
      endsAt: secondEnd,
    });

    assert.equal(overlaps.length, 0);
  });

  it('detects exact overlap', async () => {
    const repository = new InMemoryAppointmentRepository();
    const startsAt = new Date('2026-07-18T14:00:00.000Z');
    const endsAt = new Date('2026-07-18T14:15:00.000Z');

    await repository.save(
      createStoredAppointment({
        id: '550e8400-e29b-41d4-a716-446655440042',
        startsAt,
        endsAt,
      }),
    );

    const overlaps = await repository.findOverlappingForNutritionist({
      tenantId: TENANT_ID,
      nutritionistId: NUTRITIONIST_ID,
      startsAt,
      endsAt,
    });

    assert.equal(overlaps.length, 1);
    assert.equal(overlaps[0]?.getId().toString(), '550e8400-e29b-41d4-a716-446655440042');
  });

  it('ignores cancelled appointments when checking overlap', async () => {
    const repository = new InMemoryAppointmentRepository();
    const startsAt = new Date('2026-07-18T14:00:00.000Z');
    const endsAt = new Date('2026-07-18T14:15:00.000Z');

    await repository.save(
      createStoredAppointment({
        id: '550e8400-e29b-41d4-a716-446655440043',
        startsAt,
        endsAt,
        status: AppointmentStatus.Cancelled,
      }),
    );

    const overlaps = await repository.findOverlappingForNutritionist({
      tenantId: TENANT_ID,
      nutritionistId: NUTRITIONIST_ID,
      startsAt,
      endsAt,
    });

    assert.equal(overlaps.length, 0);
  });

  it('excludes appointment by id when requested', async () => {
    const repository = new InMemoryAppointmentRepository();
    const startsAt = new Date('2026-07-18T14:00:00.000Z');
    const endsAt = new Date('2026-07-18T14:15:00.000Z');
    const appointmentId = '550e8400-e29b-41d4-a716-446655440044';

    await repository.save(
      createStoredAppointment({
        id: appointmentId,
        startsAt,
        endsAt,
      }),
    );

    const overlaps = await repository.findOverlappingForNutritionist({
      tenantId: TENANT_ID,
      nutritionistId: NUTRITIONIST_ID,
      startsAt,
      endsAt,
      excludeAppointmentId: appointmentId,
    });

    assert.equal(overlaps.length, 0);
  });

  it('finds overlapping appointments for patient', async () => {
    const repository = new InMemoryAppointmentRepository();
    const startsAt = new Date('2026-07-18T14:00:00.000Z');
    const endsAt = new Date('2026-07-18T14:15:00.000Z');

    await repository.save(
      createStoredAppointment({
        id: '550e8400-e29b-41d4-a716-446655440045',
        startsAt,
        endsAt,
      }),
    );

    const overlaps = await repository.findOverlappingForPatient({
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      startsAt: new Date('2026-07-18T14:05:00.000Z'),
      endsAt: new Date('2026-07-18T14:20:00.000Z'),
    });

    assert.equal(overlaps.length, 1);
  });
});
