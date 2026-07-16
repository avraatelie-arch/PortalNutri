import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientValidationError extends ApplicationError {
  readonly code = 'PATIENT_VALIDATION_FAILED' as const;

  constructor(message: string) {
    super(message);
    this.name = 'PatientValidationError';
  }
}
