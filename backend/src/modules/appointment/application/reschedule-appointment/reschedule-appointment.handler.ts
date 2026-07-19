import type { AppointmentRepository } from '../../domain/repositories/appointment-repository.js';
import type { Clock } from '../ports/clock.port.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeAppointmentUseCase } from '../execute-appointment-use-case.js';
import { parseAppointmentTimestamp } from '../parse-appointment-timestamp.js';
import { loadTenantScopedAppointment } from '../load-tenant-scoped-appointment.js';
import { ensureNoSchedulingConflicts } from '../ensure-no-scheduling-conflicts.js';
import { persistAndDispatchAppointmentEvents } from '../persist-and-dispatch-appointment-events.js';
import { toAppointmentResult } from '../appointment-result.js';
import { RescheduleAppointmentCommand } from './reschedule-appointment.command.js';

export class RescheduleAppointmentHandler {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: RescheduleAppointmentCommand) {
    return executeAppointmentUseCase(async () => {
      const appointment = await loadTenantScopedAppointment(
        this.appointmentRepository,
        command.request.tenantId,
        command.request.appointmentId,
      );

      const startsAt = parseAppointmentTimestamp(command.request.startsAt);
      const endsAt = parseAppointmentTimestamp(command.request.endsAt);

      await ensureNoSchedulingConflicts(this.appointmentRepository, {
        tenantId: command.request.tenantId,
        patientId: appointment.getPatientId(),
        nutritionistId: appointment.getNutritionistId(),
        startsAt,
        endsAt,
        excludeAppointmentId: appointment.getId().toString(),
      });

      appointment.reschedule(startsAt, endsAt, this.clock.now());
      await persistAndDispatchAppointmentEvents(
        this.appointmentRepository,
        this.eventDispatcher,
        appointment,
      );

      return toAppointmentResult(appointment);
    });
  }
}
