import { ApplicationError } from './application-error.js';

export class PersonValidationError extends ApplicationError {
  readonly code = 'PERSON_VALIDATION_FAILED' as const;

  constructor(message: string) {
    super(message);
    this.name = 'PersonValidationError';
  }
}
