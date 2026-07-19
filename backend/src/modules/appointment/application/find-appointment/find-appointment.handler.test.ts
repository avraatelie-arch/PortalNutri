import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { AppointmentModeValue } from '../../domain/value-objects/appointment-mode.js';
import { InMemoryNutritionistDirectory } from '../../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryPatientDirectory } from '../../infrastructure/adapters/in-memory-patient-directory.js';
import { InMemoryPatientNutritionistAssignmentDirectory } from '../../infrastructure/adapters/in-memory-patient-nutritionist-assignment-directory.js';
import { InMemoryTenantDirectory } from '../../infrastructure/adapters/in-memory-tenant-directory.js';
import { InMemoryAppointmentRepository } from '../../infrastructure/repositories/in-memory-appointment.repository.js';
import { AppointmentNotFoundError } from '../errors/appointment-not-found.error.js';
import { ScheduleAppointmentCommand } from '../schedule-appointment/schedule-appointment.command.js';
import { ScheduleAppointmentHandler } from '../schedule-appointment/schedule-appointment.handler.js';
import { FindAppointmentHandler } from './find-appointment.handler.js';
import { FindAppointmentQuery } from './find-appointment.query.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const FUTURE_START = '2026-07-18T14:00:00.000Z';
const FUTURE_END_15 = '2026-07-18T14:15:00.000Z';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';

async function seedScheduledAppointment() {
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
    }),
  );

  return { appointmentRepository, scheduled };
}

describe('FindAppointmentHandler', () => {
  it('finds an appointment scoped to tenant', async () => {
    const { appointmentRepository, scheduled } = await seedScheduledAppointment();
    const handler = new FindAppointmentHandler(appointmentRepository);

    const found = await handler.execute(
      new FindAppointmentQuery({
        tenantId: TENANT_ID,
        appointmentId: scheduled.id,
      }),
    );

    assert.equal(found.id, scheduled.id);
    assert.equal(found.tenantId, TENANT_ID);
    assert.equal(found.startsAt, FUTURE_START);
  });

  it('throws AppointmentNotFoundError for wrong tenant', async () => {
    const { appointmentRepository, scheduled } = await seedScheduledAppointment();
    const handler = new FindAppointmentHandler(appointmentRepository);

    await assert.rejects(
      () =>
        handler.execute(
          new FindAppointmentQuery({
            tenantId: OTHER_TENANT_ID,
            appointmentId: scheduled.id,
          }),
        ),
      AppointmentNotFoundError,
    );
  });

  it('throws AppointmentNotFoundError when appointment does not exist', async () => {
    const handler = new FindAppointmentHandler(new InMemoryAppointmentRepository());

    await assert.rejects(
      () =>
        handler.execute(
          new FindAppointmentQuery({
            tenantId: TENANT_ID,
            appointmentId: '550e8400-e29b-41d4-a716-446655440088',
          }),
        ),
      AppointmentNotFoundError,
    );
  });
});
