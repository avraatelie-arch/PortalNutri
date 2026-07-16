import type { PatientRepository } from '../../domain/repositories/patient-repository.js';
import { PatientId } from '../../domain/value-objects/patient-id.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executePatientUseCase } from '../execute-patient-use-case.js';
import { PatientNotFoundError } from '../errors/patient-not-found.error.js';
import { ActivatePatientCommand } from './activate-patient.command.js';
import { toActivatePatientResult } from './activate-patient.result.js';

export class ActivatePatientHandler {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: ActivatePatientCommand) {
    return executePatientUseCase(async () => {
      const patient = await this.patientRepository.findById(
        PatientId.create(command.patientId),
      );

      if (!patient) {
        throw new PatientNotFoundError(command.patientId);
      }

      patient.activate();
      const events = patient.pullDomainEvents();

      if (events.length > 0) {
        await this.patientRepository.save(patient);
        await this.eventDispatcher.dispatch(events);
      }

      return toActivatePatientResult(patient);
    });
  }
}
