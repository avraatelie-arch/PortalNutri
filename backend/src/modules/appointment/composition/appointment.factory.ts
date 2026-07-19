import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import type { Clock } from '../application/ports/clock.port.js';
import type { TenantDirectoryPort } from '../application/ports/tenant-directory.port.js';
import type { PatientDirectoryPort } from '../application/ports/patient-directory.port.js';
import type { NutritionistDirectoryPort } from '../application/ports/nutritionist-directory.port.js';
import type { PatientNutritionistAssignmentDirectoryPort } from '../application/ports/patient-nutritionist-assignment-directory.port.js';
import type { AppointmentRepository } from '../domain/repositories/appointment-repository.js';
import { ScheduleAppointmentHandler } from '../application/schedule-appointment/schedule-appointment.handler.js';
import { FindAppointmentHandler } from '../application/find-appointment/find-appointment.handler.js';
import { ConfirmAppointmentHandler } from '../application/confirm-appointment/confirm-appointment.handler.js';
import { RescheduleAppointmentHandler } from '../application/reschedule-appointment/reschedule-appointment.handler.js';
import { CancelAppointmentHandler } from '../application/cancel-appointment/cancel-appointment.handler.js';
import { CompleteAppointmentHandler } from '../application/complete-appointment/complete-appointment.handler.js';
import { MarkAppointmentNoShowHandler } from '../application/mark-appointment-no-show/mark-appointment-no-show.handler.js';
import { UpdateAppointmentNotesHandler } from '../application/update-appointment-notes/update-appointment-notes.handler.js';

export interface AppointmentFactoryDependencies {
  appointmentRepository: AppointmentRepository;
  tenantDirectory: TenantDirectoryPort;
  patientDirectory: PatientDirectoryPort;
  nutritionistDirectory: NutritionistDirectoryPort;
  assignmentDirectory: PatientNutritionistAssignmentDirectoryPort;
  clock: Clock;
  eventDispatcher: EventDispatcher;
}

export interface AppointmentHandlers {
  scheduleAppointmentHandler: ScheduleAppointmentHandler;
  findAppointmentHandler: FindAppointmentHandler;
  confirmAppointmentHandler: ConfirmAppointmentHandler;
  rescheduleAppointmentHandler: RescheduleAppointmentHandler;
  cancelAppointmentHandler: CancelAppointmentHandler;
  completeAppointmentHandler: CompleteAppointmentHandler;
  markAppointmentNoShowHandler: MarkAppointmentNoShowHandler;
  updateAppointmentNotesHandler: UpdateAppointmentNotesHandler;
}

export function createAppointmentHandlers(
  deps: AppointmentFactoryDependencies,
): AppointmentHandlers {
  return {
    scheduleAppointmentHandler: new ScheduleAppointmentHandler(
      deps.appointmentRepository,
      deps.tenantDirectory,
      deps.patientDirectory,
      deps.nutritionistDirectory,
      deps.assignmentDirectory,
      deps.clock,
      deps.eventDispatcher,
    ),
    findAppointmentHandler: new FindAppointmentHandler(deps.appointmentRepository),
    confirmAppointmentHandler: new ConfirmAppointmentHandler(
      deps.appointmentRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    rescheduleAppointmentHandler: new RescheduleAppointmentHandler(
      deps.appointmentRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    cancelAppointmentHandler: new CancelAppointmentHandler(
      deps.appointmentRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    completeAppointmentHandler: new CompleteAppointmentHandler(
      deps.appointmentRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    markAppointmentNoShowHandler: new MarkAppointmentNoShowHandler(
      deps.appointmentRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
    updateAppointmentNotesHandler: new UpdateAppointmentNotesHandler(
      deps.appointmentRepository,
      deps.clock,
      deps.eventDispatcher,
    ),
  };
}
