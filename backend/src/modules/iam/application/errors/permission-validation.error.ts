import { ApplicationError } from './application-error.js';

export class PermissionValidationError extends ApplicationError {
  readonly code = 'PERMISSION_VALIDATION_FAILED' as const;

  constructor(message: string) {
    super(message);
    this.name = 'PermissionValidationError';
  }
}
