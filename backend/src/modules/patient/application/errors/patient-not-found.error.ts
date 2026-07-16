import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientNotFoundError extends ApplicationError {
  readonly code = 'PATIENT_NOT_FOUND' as const;

  constructor(readonly patientId: string) {
    super(`Patient with id "${patientId}" was not found.`);
    this.name = 'PatientNotFoundError';
  }
}
