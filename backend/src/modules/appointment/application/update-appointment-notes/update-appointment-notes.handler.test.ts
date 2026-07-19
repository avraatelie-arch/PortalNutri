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
import { AppointmentNotFoundError } from '../errors/appointment-not-found.error.js';
import { AppointmentValidationError } from '../errors/appointment-validation.error.js';
import { CompleteAppointmentCommand } from '../complete-appointment/complete-appointment.command.js';
import { CompleteAppointmentHandler } from '../complete-appointment/complete-appointment.handler.js';
import { ScheduleAppointmentCommand } from '../schedule-appointment/schedule-appointment.command.js';
import { ScheduleAppointmentHandler } from '../schedule-appointment/schedule-appointment.handler.js';
import { UpdateAppointmentNotesCommand } from './update-appointment-notes.command.js';
import { UpdateAppointmentNotesHandler } from './update-appointment-notes.handler.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const FUTURE_START = '2026-07-18T14:00:00.000Z';
const FUTURE_END_15 = '2026-07-18T14:15:00.000Z';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';

async function seedScheduledAppointment(notes?: string | null) {
  const appointmentRepository = new InMemoryAppointmentRepository();
  const tenantDirectory = new InMemoryTenantDirectory();
  tenantDirectory.seed({ id: TENANT_ID, status: 'ACTIVE' });

  const patientDirectory = new InMemoryPatientDirectory();
  patientDirectory.seed({ id: PATIENT_ID, tenantId: TENANT_ID, status: 'ACTIVE' });

  const nutritionistDirectory = new InMemoryNutritionistDirectory();
  nutritionistDirectory.seed({
    id: NUTRITIONIST_ID,
    tenantId: TENANT_ID,
    status: 'ACTIVE',
  });

  const assignmentDirectory = new InMemoryPatientNutritionistAssignmentDirectory();
  assignmentDirectory.seed(TENANT_ID, PATIENT_ID, NUTRITIONIST_ID);

  const scheduleHandler = new ScheduleAppointmentHandler(
    appointmentRepository,
    tenantDirectory,
    patientDirectory,
    nutritionistDirectory,
    assignmentDirectory,
    new FixedClock(NOW),
    noopEventDispatcher,
  );

  const scheduled = await scheduleHandler.execute(
    new ScheduleAppointmentCommand({
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      nutritionistId: NUTRITIONIST_ID,
      startsAt: FUTURE_START,
      endsAt: FUTURE_END_15,
      mode: AppointmentModeValue.InPerson,
      notes,
    }),
  );

  return { appointmentRepository, scheduled };
}

describe('UpdateAppointmentNotesHandler', () => {
  it('updates appointment notes', async () => {
    const { appointmentRepository, scheduled } = await seedScheduledAppointment();
    const handler = new UpdateAppointmentNotesHandler(
      appointmentRepository,
      new FixedClock(NOW),
      noopEventDispatcher,
    );

    const updated = await handler.execute(
      new UpdateAppointmentNotesCommand({
        tenantId: TENANT_ID,
        appointmentId: scheduled.id,
        notes: 'Updated notes',
      }),
    );

    assert.equal(updated.notes, 'Updated notes');
  });

  it('update notes is idempotent when unchanged', async () => {
    const { appointmentRepository, scheduled } = await seedScheduledAppointment('Same notes');
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new UpdateAppointmentNotesHandler(
      appointmentRepository,
      new FixedClock(NOW),
      eventDispatcher,
    );

    await handler.execute(
      new UpdateAppointmentNotesCommand({
        tenantId: TENANT_ID,
        appointmentId: scheduled.id,
        notes: 'Same notes',
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 0);
  });

  it('dispatches AppointmentNotesUpdated when notes change', async () => {
    const { appointmentRepository, scheduled } = await seedScheduledAppointment();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new UpdateAppointmentNotesHandler(
      appointmentRepository,
      new FixedClock(NOW),
      eventDispatcher,
    );

    await handler.execute(
      new UpdateAppointmentNotesCommand({
        tenantId: TENANT_ID,
        appointmentId: scheduled.id,
        notes: 'New notes',
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'AppointmentNotesUpdated',
    );
  });

  it('throws AppointmentNotFoundError for wrong tenant', async () => {
    const { appointmentRepository, scheduled } = await seedScheduledAppointment();
    const handler = new UpdateAppointmentNotesHandler(
      appointmentRepository,
      new FixedClock(NOW),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new UpdateAppointmentNotesCommand({
            tenantId: OTHER_TENANT_ID,
            appointmentId: scheduled.id,
            notes: 'Wrong tenant',
          }),
        ),
      AppointmentNotFoundError,
    );
  });

  it('rejects updating notes on completed appointment', async () => {
    const { appointmentRepository, scheduled } = await seedScheduledAppointment();
    const handler = new UpdateAppointmentNotesHandler(
      appointmentRepository,
      new FixedClock(NOW),
      noopEventDispatcher,
    );

    await new CompleteAppointmentHandler(
      appointmentRepository,
      new FixedClock(NOW),
      noopEventDispatcher,
    ).execute(
      new CompleteAppointmentCommand({
        tenantId: TENANT_ID,
        appointmentId: scheduled.id,
      }),
    );

    await assert.rejects(
      () =>
        handler.execute(
          new UpdateAppointmentNotesCommand({
            tenantId: TENANT_ID,
            appointmentId: scheduled.id,
            notes: 'Too late',
          }),
        ),
      AppointmentValidationError,
    );
  });
});
