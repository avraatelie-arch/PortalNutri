import type { AppointmentRepository } from '../../domain/repositories/appointment-repository.js';
import type { Clock } from '../ports/clock.port.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeAppointmentUseCase } from '../execute-appointment-use-case.js';
import { loadTenantScopedAppointment } from '../load-tenant-scoped-appointment.js';
import { persistAndDispatchAppointmentEvents } from '../persist-and-dispatch-appointment-events.js';
import { toAppointmentResult } from '../appointment-result.js';
import { CancelAppointmentCommand } from './cancel-appointment.command.js';

export class CancelAppointmentHandler {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: CancelAppointmentCommand) {
    return executeAppointmentUseCase(async () => {
      const appointment = await loadTenantScopedAppointment(
        this.appointmentRepository,
        command.request.tenantId,
        command.request.appointmentId,
      );

      appointment.cancel(command.request.reason, this.clock.now());
      await persistAndDispatchAppointmentEvents(
        this.appointmentRepository,
        this.eventDispatcher,
        appointment,
      );

      return toAppointmentResult(appointment);
    });
  }
}
