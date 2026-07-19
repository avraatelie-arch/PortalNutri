import type { AppointmentRepository } from '../../domain/repositories/appointment-repository.js';
import type { TenantDirectoryPort } from '../ports/tenant-directory.port.js';
import type { PatientDirectoryPort } from '../ports/patient-directory.port.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import type { PatientNutritionistAssignmentDirectoryPort } from '../ports/patient-nutritionist-assignment-directory.port.js';
import type { Clock } from '../ports/clock.port.js';
import { Appointment } from '../../domain/aggregates/appointment.aggregate.js';
import { AppointmentMode } from '../../domain/value-objects/appointment-mode.js';
import { AppointmentNotes } from '../../domain/value-objects/appointment-notes.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeAppointmentUseCase } from '../execute-appointment-use-case.js';
import { parseAppointmentTimestamp } from '../parse-appointment-timestamp.js';
import { validateAppointmentSchedulingPreconditions } from '../validate-appointment-scheduling-preconditions.js';
import { ensureNoSchedulingConflicts } from '../ensure-no-scheduling-conflicts.js';
import { persistAndDispatchAppointmentEvents } from '../persist-and-dispatch-appointment-events.js';
import { toAppointmentResult } from '../appointment-result.js';
import { ScheduleAppointmentCommand } from './schedule-appointment.command.js';

export class ScheduleAppointmentHandler {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly tenantDirectory: TenantDirectoryPort,
    private readonly patientDirectory: PatientDirectoryPort,
    private readonly nutritionistDirectory: NutritionistDirectoryPort,
    private readonly assignmentDirectory: PatientNutritionistAssignmentDirectoryPort,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: ScheduleAppointmentCommand) {
    return executeAppointmentUseCase(async () => {
      const startsAt = parseAppointmentTimestamp(command.request.startsAt);
      const endsAt = parseAppointmentTimestamp(command.request.endsAt);
      const now = this.clock.now();

      await validateAppointmentSchedulingPreconditions({
        tenantDirectory: this.tenantDirectory,
        patientDirectory: this.patientDirectory,
        nutritionistDirectory: this.nutritionistDirectory,
        assignmentDirectory: this.assignmentDirectory,
        tenantId: command.request.tenantId,
        patientId: command.request.patientId,
        nutritionistId: command.request.nutritionistId,
      });

      await ensureNoSchedulingConflicts(this.appointmentRepository, {
        tenantId: command.request.tenantId,
        patientId: command.request.patientId,
        nutritionistId: command.request.nutritionistId,
        startsAt,
        endsAt,
      });

      const appointment = Appointment.create({
        tenantId: command.request.tenantId,
        patientId: command.request.patientId,
        nutritionistId: command.request.nutritionistId,
        startsAt,
        endsAt,
        mode: AppointmentMode.create(command.request.mode),
        notes: AppointmentNotes.create(command.request.notes),
        now,
      });

      await this.appointmentRepository.save(appointment);
      await this.eventDispatcher.dispatch(appointment.pullDomainEvents());

      return toAppointmentResult(appointment);
    });
  }
}
