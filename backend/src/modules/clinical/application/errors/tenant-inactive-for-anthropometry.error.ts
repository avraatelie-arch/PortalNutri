import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class TenantInactiveForAnthropometryError extends ApplicationError {
  readonly code = 'TENANT_INACTIVE_FOR_ANTHROPOMETRY' as const;

  constructor(readonly tenantId: string) {
    super(`Tenant with id "${tenantId}" must be ACTIVE.`);
    this.name = 'TenantInactiveForAnthropometryError';
  }
}
