import type { AppointmentRepository } from '../../domain/repositories/appointment-repository.js';
import { executeAppointmentUseCase } from '../execute-appointment-use-case.js';
import { loadTenantScopedAppointment } from '../load-tenant-scoped-appointment.js';
import { toAppointmentResult } from '../appointment-result.js';
import { FindAppointmentQuery } from './find-appointment.query.js';

export class FindAppointmentHandler {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(query: FindAppointmentQuery) {
    return executeAppointmentUseCase(async () => {
      const appointment = await loadTenantScopedAppointment(
        this.appointmentRepository,
        query.request.tenantId,
        query.request.appointmentId,
      );

      return toAppointmentResult(appointment);
    });
  }
}
