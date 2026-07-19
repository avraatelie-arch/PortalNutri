import type { Appointment } from '../domain/aggregates/appointment.aggregate.js';
import type { AppointmentModeValue } from '../domain/value-objects/appointment-mode.js';
import type { AppointmentStatus } from '../domain/value-objects/appointment-status.js';

export interface AppointmentResult {
  id: string;
  tenantId: string;
  patientId: string;
  nutritionistId: string;
  startsAt: string;
  endsAt: string;
  mode: AppointmentModeValue;
  status: AppointmentStatus;
  notes: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  cancelledAt: string | null;
  completedAt: string | null;
}

export function toAppointmentResult(appointment: Appointment): AppointmentResult {
  return {
    id: appointment.getId().toString(),
    tenantId: appointment.getTenantId(),
    patientId: appointment.getPatientId(),
    nutritionistId: appointment.getNutritionistId(),
    startsAt: appointment.getStartsAt().toISOString(),
    endsAt: appointment.getEndsAt().toISOString(),
    mode: appointment.getMode().toString(),
    status: appointment.getStatus(),
    notes: appointment.getNotes().toString(),
    cancellationReason: appointment.getCancellationReason(),
    createdAt: appointment.getCreatedAt().toISOString(),
    updatedAt: appointment.getUpdatedAt().toISOString(),
    cancelledAt: appointment.getCancelledAt()?.toISOString() ?? null,
    completedAt: appointment.getCompletedAt()?.toISOString() ?? null,
  };
}
