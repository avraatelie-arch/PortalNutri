import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PrescriptionValidationError extends ApplicationError {
  readonly code = 'PRESCRIPTION_VALIDATION_ERROR' as const;

  constructor(message: string) {
    super(message);
    this.name = 'PrescriptionValidationError';
  }
}
