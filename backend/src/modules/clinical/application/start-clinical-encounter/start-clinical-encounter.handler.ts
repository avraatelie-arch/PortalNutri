import type { ClinicalEncounterRepository } from '../../domain/repositories/clinical-encounter-repository.js';
import type { TenantDirectoryPort } from '../ports/tenant-directory.port.js';
import type { PatientDirectoryPort } from '../ports/patient-directory.port.js';
import type { NutritionistDirectoryPort } from '../ports/nutritionist-directory.port.js';
import type { AppointmentDirectoryPort } from '../ports/appointment-directory.port.js';
import type { Clock } from '../ports/clock.port.js';
import { ClinicalEncounter } from '../../domain/aggregates/clinical-encounter.aggregate.js';
import { ClinicalEncounterType } from '../../domain/value-objects/clinical-encounter-type.js';
import { ClinicalNotes } from '../../domain/value-objects/clinical-notes.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { validateClinicalEncounterStartPreconditions } from '../validate-clinical-encounter-start-preconditions.js';
import { toClinicalEncounterResult } from '../clinical-encounter-result.js';
import { AppointmentNotFoundForEncounterError } from '../errors/appointment-not-found-for-encounter.error.js';
import { AppointmentNotCompletedError } from '../errors/appointment-not-completed.error.js';
import { ClinicalEncounterTenantMismatchError } from '../errors/clinical-encounter-tenant-mismatch.error.js';
import { ClinicalEncounterAlreadyExistsForAppointmentError } from '../errors/clinical-encounter-already-exists-for-appointment.error.js';
import { ClinicalEncounterAlreadyOpenError } from '../errors/clinical-encounter-already-open.error.js';
import { StartClinicalEncounterCommand } from './start-clinical-encounter.command.js';

export class StartClinicalEncounterHandler {
  constructor(
    private readonly encounterRepository: ClinicalEncounterRepository,
    private readonly tenantDirectory: TenantDirectoryPort,
    private readonly patientDirectory: PatientDirectoryPort,
    private readonly nutritionistDirectory: NutritionistDirectoryPort,
    private readonly appointmentDirectory: AppointmentDirectoryPort,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: StartClinicalEncounterCommand) {
    return executeClinicalUseCase(async () => {
      const { tenantId, patientId, nutritionistId } = command.request;

      await validateClinicalEncounterStartPreconditions({
        tenantDirectory: this.tenantDirectory,
        patientDirectory: this.patientDirectory,
        nutritionistDirectory: this.nutritionistDirectory,
        tenantId,
        patientId,
        nutritionistId,
      });

      let appointmentId: string | null = command.request.appointmentId ?? null;

      if (appointmentId) {
        const appointment = await this.appointmentDirectory.findByTenantAndId(
          tenantId,
          appointmentId,
        );

        if (!appointment) {
          throw new AppointmentNotFoundForEncounterError(tenantId, appointmentId);
        }

        if (appointment.patientId !== patientId) {
          throw new ClinicalEncounterTenantMismatchError(
            tenantId,
            'appointment patient',
            appointmentId,
          );
        }

        if (appointment.nutritionistId !== nutritionistId) {
          throw new ClinicalEncounterTenantMismatchError(
            tenantId,
            'appointment nutritionist',
            appointmentId,
          );
        }

        if (appointment.status !== 'COMPLETED') {
          throw new AppointmentNotCompletedError(tenantId, appointmentId);
        }

        const existingForAppointment =
          await this.encounterRepository.findByAppointment(tenantId, appointmentId);

        if (existingForAppointment) {
          throw new ClinicalEncounterAlreadyExistsForAppointmentError(
            tenantId,
            appointmentId,
          );
        }
      }

      const openEncounter = await this.encounterRepository.findOpenEncounter(
        tenantId,
        patientId,
        nutritionistId,
      );

      if (openEncounter) {
        throw new ClinicalEncounterAlreadyOpenError(
          tenantId,
          patientId,
          nutritionistId,
        );
      }

      const now = this.clock.now();

      const encounter = ClinicalEncounter.create({
        tenantId,
        appointmentId,
        patientId,
        nutritionistId,
        type: ClinicalEncounterType.create(command.request.type),
        notes: ClinicalNotes.create(command.request.notes),
        startedAt: now,
        now,
      });

      await this.encounterRepository.save(encounter);
      await this.eventDispatcher.dispatch(encounter.pullDomainEvents());

      return toClinicalEncounterResult(encounter);
    });
  }
}
