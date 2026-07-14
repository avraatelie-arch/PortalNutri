import { ApplicationError } from './application-error.js';

export class PermissionAssignmentValidationError extends ApplicationError {
  readonly code = 'PERMISSION_ASSIGNMENT_VALIDATION_FAILED' as const;

  constructor(message: string) {
    super(message);
    this.name = 'PermissionAssignmentValidationError';
  }
}
