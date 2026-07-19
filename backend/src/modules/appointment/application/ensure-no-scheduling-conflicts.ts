import type { AppointmentRepository } from '../domain/repositories/appointment-repository.js';
import { AppointmentConflictError } from './errors/appointment-conflict.error.js';

export async function ensureNoSchedulingConflicts(
  repository: AppointmentRepository,
  params: {
    tenantId: string;
    patientId: string;
    nutritionistId: string;
    startsAt: Date;
    endsAt: Date;
    excludeAppointmentId?: string;
  },
): Promise<void> {
  const nutritionistOverlaps =
    await repository.findOverlappingForNutritionist({
      tenantId: params.tenantId,
      nutritionistId: params.nutritionistId,
      startsAt: params.startsAt,
      endsAt: params.endsAt,
      excludeAppointmentId: params.excludeAppointmentId,
    });

  if (nutritionistOverlaps.length > 0) {
    throw new AppointmentConflictError(params.tenantId);
  }

  const patientOverlaps = await repository.findOverlappingForPatient({
    tenantId: params.tenantId,
    patientId: params.patientId,
    startsAt: params.startsAt,
    endsAt: params.endsAt,
    excludeAppointmentId: params.excludeAppointmentId,
  });

  if (patientOverlaps.length > 0) {
    throw new AppointmentConflictError(params.tenantId);
  }
}
