import { ApplicationError } from './application-error.js';

export class RoleValidationError extends ApplicationError {
  readonly code = 'ROLE_VALIDATION_FAILED' as const;

  constructor(message: string) {
    super(message);
    this.name = 'RoleValidationError';
  }
}
