import { ApplicationError } from './application-error.js';

export class TenantNotFoundError extends ApplicationError {
  readonly code = 'TENANT_NOT_FOUND' as const;

  constructor(readonly tenantId: string) {
    super(`Tenant with id "${tenantId}" was not found.`);
    this.name = 'TenantNotFoundError';
  }
}
