import { ApplicationError } from './application-error.js';

export class RoleAssignmentValidationError extends ApplicationError {
  readonly code = 'ROLE_ASSIGNMENT_VALIDATION_FAILED' as const;

  constructor(message: string) {
    super(message);
    this.name = 'RoleAssignmentValidationError';
  }
}
