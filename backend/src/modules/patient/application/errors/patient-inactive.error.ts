import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientInactiveError extends ApplicationError {
  readonly code = 'PATIENT_INACTIVE' as const;

  constructor(readonly patientId: string) {
    super(`Patient with id "${patientId}" is inactive.`);
    this.name = 'PatientInactiveError';
  }
}
