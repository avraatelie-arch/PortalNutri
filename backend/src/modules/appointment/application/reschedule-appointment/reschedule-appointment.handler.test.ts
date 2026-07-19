import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { AppointmentModeValue } from '../../domain/value-objects/appointment-mode.js';
import { InMemoryNutritionistDirectory } from '../../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryPatientDirectory } from '../../infrastructure/adapters/in-memory-patient-directory.js';
import { InMemoryPatientNutritionistAssignmentDirectory } from '../../infrastructure/adapters/in-memory-patient-nutritionist-assignment-directory.js';
import { InMemoryTenantDirectory } from '../../infrastructure/adapters/in-memory-tenant-directory.js';
import { InMemoryAppointmentRepository } from '../../infrastructure/repositories/in-memory-appointment.repository.js';
import { AppointmentConflictError } from '../errors/appointment-conflict.error.js';
import { ScheduleAppointmentCommand } from '../schedule-appointment/schedule-appointment.command.js';
import { ScheduleAppointmentHandler } from '../schedule-appointment/schedule-appointment.handler.js';
import { RescheduleAppointmentCommand } from './reschedule-appointment.command.js';
import { RescheduleAppointmentHandler } from './reschedule-appointment.handler.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const FUTURE_START = '2026-07-18T14:00:00.000Z';
const FUTURE_END_15 = '2026-07-18T14:15:00.000Z';
const FUTURE_END_30 = '2026-07-18T14:30:00.000Z';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const OTHER_PATIENT_ID = '550e8400-e29b-41d4-a716-446655440021';

async function seedAppointmentContext() {
  const appointmentRepository = new InMemoryAppointmentRepository();
  const tenantDirectory = new InMemoryTenantDirectory();
  tenantDirectory.seed({ id: TENANT_ID, status: 'ACTIVE' });

  const patientDirectory = new InMemoryPatientDirectory();
  patientDirectory.seed({ id: PATIENT_ID, tenantId: TENANT_ID, status: 'ACTIVE' });
  patientDirectory.seed({
    id: OTHER_PATIENT_ID,
    tenantId: TENANT_ID,
    status: 'ACTIVE',
  });

  const nutritionistDirectory = new InMemoryNutritionistDirectory();
  nutritionistDirectory.seed({
    id: NUTRITIONIST_ID,
    tenantId: TENANT_ID,
    status: 'ACTIVE',
  });

  const assignmentDirectory = new InMemoryPatientNutritionistAssignmentDirectory();
  assignmentDirectory.seed(TENANT_ID, PATIENT_ID, NUTRITIONIST_ID);
  assignmentDirectory.seed(TENANT_ID, OTHER_PATIENT_ID, NUTRITIONIST_ID);

  const scheduleHandler = new ScheduleAppointmentHandler(
    appointmentRepository,
    tenantDirectory,
    patientDirectory,
    nutritionistDirectory,
    assignmentDirectory,
    new FixedClock(NOW),
    noopEventDispatcher,
  );

  const rescheduleHandler = new RescheduleAppointmentHandler(
    appointmentRepository,
    new FixedClock(NOW),
    noopEventDispatcher,
  );

  return {
    appointmentRepository,
    scheduleHandler,
    rescheduleHandler,
  };
}

describe('RescheduleAppointmentHandler', () => {
  it('reschedules to a new valid slot', async () => {
    const { scheduleHandler, rescheduleHandler } = await seedAppointmentContext();

    const scheduled = await scheduleHandler.execute(
      new ScheduleAppointmentCommand({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
        nutritionistId: NUTRITIONIST_ID,
        startsAt: FUTURE_START,
        endsAt: FUTURE_END_15,
        mode: AppointmentModeValue.InPerson,
      }),
    );

    const newStart = '2026-07-19T10:00:00.000Z';
    const newEnd = '2026-07-19T10:15:00.000Z';

    const rescheduled = await rescheduleHandler.execute(
      new RescheduleAppointmentCommand({
        tenantId: TENANT_ID,
        appointmentId: scheduled.id,
        startsAt: newStart,
        endsAt: newEnd,
      }),
    );

    assert.equal(rescheduled.startsAt, newStart);
    assert.equal(rescheduled.endsAt, newEnd);
  });

  it('excludes self when checking conflicts', async () => {
    const { scheduleHandler, rescheduleHandler } = await seedAppointmentContext();

    const scheduled = await scheduleHandler.execute(
      new ScheduleAppointmentCommand({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
        nutritionistId: NUTRITIONIST_ID,
        startsAt: FUTURE_START,
        endsAt: FUTURE_END_15,
        mode: AppointmentModeValue.InPerson,
      }),
    );

    const sameSlot = await rescheduleHandler.execute(
      new RescheduleAppointmentCommand({
        tenantId: TENANT_ID,
        appointmentId: scheduled.id,
        startsAt: FUTURE_START,
        endsAt: FUTURE_END_15,
      }),
    );

    assert.equal(sameSlot.startsAt, FUTURE_START);
    assert.equal(sameSlot.endsAt, FUTURE_END_15);
  });

  it('rejects reschedule that conflicts with another appointment', async () => {
    const { scheduleHandler, rescheduleHandler } = await seedAppointmentContext();

    const first = await scheduleHandler.execute(
      new ScheduleAppointmentCommand({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
        nutritionistId: NUTRITIONIST_ID,
        startsAt: FUTURE_START,
        endsAt: FUTURE_END_15,
        mode: AppointmentModeValue.InPerson,
      }),
    );

    await scheduleHandler.execute(
      new ScheduleAppointmentCommand({
        tenantId: TENANT_ID,
        patientId: OTHER_PATIENT_ID,
        nutritionistId: NUTRITIONIST_ID,
        startsAt: '2026-07-18T16:00:00.000Z',
        endsAt: '2026-07-18T16:15:00.000Z',
        mode: AppointmentModeValue.InPerson,
      }),
    );

    await assert.rejects(
      () =>
        rescheduleHandler.execute(
          new RescheduleAppointmentCommand({
            tenantId: TENANT_ID,
            appointmentId: first.id,
            startsAt: '2026-07-18T16:05:00.000Z',
            endsAt: '2026-07-18T16:20:00.000Z',
          }),
        ),
      AppointmentConflictError,
    );
  });

  it('allows adjacent reschedule without overlap', async () => {
    const { scheduleHandler, rescheduleHandler } = await seedAppointmentContext();

    const scheduled = await scheduleHandler.execute(
      new ScheduleAppointmentCommand({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
        nutritionistId: NUTRITIONIST_ID,
        startsAt: FUTURE_START,
        endsAt: FUTURE_END_15,
        mode: AppointmentModeValue.InPerson,
      }),
    );

    await scheduleHandler.execute(
      new ScheduleAppointmentCommand({
        tenantId: TENANT_ID,
        patientId: OTHER_PATIENT_ID,
        nutritionistId: NUTRITIONIST_ID,
        startsAt: FUTURE_END_15,
        endsAt: FUTURE_END_30,
        mode: AppointmentModeValue.InPerson,
      }),
    );

    const adjacent = await rescheduleHandler.execute(
      new RescheduleAppointmentCommand({
        tenantId: TENANT_ID,
        appointmentId: scheduled.id,
        startsAt: '2026-07-18T13:45:00.000Z',
        endsAt: FUTURE_START,
      }),
    );

    assert.equal(adjacent.endsAt, FUTURE_START);
  });

  it('dispatches AppointmentRescheduled after persistence', async () => {
    const context = await seedAppointmentContext();
    const eventDispatcher = new CapturingEventDispatcher();
    const rescheduleHandler = new RescheduleAppointmentHandler(
      context.appointmentRepository,
      new FixedClock(NOW),
      eventDispatcher,
    );

    const scheduled = await context.scheduleHandler.execute(
      new ScheduleAppointmentCommand({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
        nutritionistId: NUTRITIONIST_ID,
        startsAt: FUTURE_START,
        endsAt: FUTURE_END_15,
        mode: AppointmentModeValue.InPerson,
      }),
    );

    await rescheduleHandler.execute(
      new RescheduleAppointmentCommand({
        tenantId: TENANT_ID,
        appointmentId: scheduled.id,
        startsAt: '2026-07-19T10:00:00.000Z',
        endsAt: '2026-07-19T10:15:00.000Z',
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'AppointmentRescheduled',
    );
  });
});
