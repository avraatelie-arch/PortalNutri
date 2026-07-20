import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class TenantNotFoundForAnamnesisError extends ApplicationError {
  readonly code = 'TENANT_NOT_FOUND_FOR_ANAMNESIS' as const;

  constructor(readonly tenantId: string) {
    super(`Tenant with id "${tenantId}" was not found.`);
    this.name = 'TenantNotFoundForAnamnesisError';
  }
}
