import { ApplicationError } from './application-error.js';

export class TenantInactiveError extends ApplicationError {
  readonly code = 'TENANT_INACTIVE' as const;

  constructor(readonly tenantId: string) {
    super(`Tenant with id "${tenantId}" is inactive.`);
    this.name = 'TenantInactiveError';
  }
}
