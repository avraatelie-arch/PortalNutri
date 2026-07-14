import { ApplicationError } from './application-error.js';

export class TenantValidationError extends ApplicationError {
  readonly code = 'TENANT_VALIDATION' as const;

  constructor(message: string) {
    super(message);
    this.name = 'TenantValidationError';
  }
}
