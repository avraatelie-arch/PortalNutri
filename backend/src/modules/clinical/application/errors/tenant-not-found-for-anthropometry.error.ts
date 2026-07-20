import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class TenantNotFoundForAnthropometryError extends ApplicationError {
  readonly code = 'TENANT_NOT_FOUND_FOR_ANTHROPOMETRY' as const;

  constructor(readonly tenantId: string) {
    super(`Tenant with id "${tenantId}" was not found.`);
    this.name = 'TenantNotFoundForAnthropometryError';
  }
}
