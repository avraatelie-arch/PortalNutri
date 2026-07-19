import type { Appointment } from '../domain/aggregates/appointment.aggregate.js';
import type { AppointmentRepository } from '../domain/repositories/appointment-repository.js';
import { AppointmentId } from '../domain/value-objects/appointment-id.js';
import { AppointmentNotFoundError } from './errors/appointment-not-found.error.js';

export async function loadTenantScopedAppointment(
  repository: AppointmentRepository,
  tenantId: string,
  appointmentId: string,
): Promise<Appointment> {
  const appointment = await repository.findByTenantAndId(
    tenantId,
    AppointmentId.create(appointmentId),
  );

  if (!appointment) {
    throw new AppointmentNotFoundError(tenantId, appointmentId);
  }

  return appointment;
}
