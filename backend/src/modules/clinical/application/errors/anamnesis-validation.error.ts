import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisValidationError extends ApplicationError {
  readonly code = 'ANAMNESIS_VALIDATION_ERROR' as const;

  constructor(message: string) {
    super(message);
    this.name = 'AnamnesisValidationError';
  }
}
