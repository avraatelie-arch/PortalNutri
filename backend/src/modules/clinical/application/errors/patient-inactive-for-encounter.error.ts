import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientInactiveForEncounterError extends ApplicationError {
  readonly code = 'PATIENT_INACTIVE_FOR_ENCOUNTER' as const;

  constructor(readonly patientId: string) {
    super(`Patient with id "${patientId}" is inactive.`);
    this.name = 'PatientInactiveForEncounterError';
  }
}
