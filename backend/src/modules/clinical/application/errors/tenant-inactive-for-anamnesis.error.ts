import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class TenantInactiveForAnamnesisError extends ApplicationError {
  readonly code = 'TENANT_INACTIVE_FOR_ANAMNESIS' as const;

  constructor(readonly tenantId: string) {
    super(`Tenant with id "${tenantId}" is inactive.`);
    this.name = 'TenantInactiveForAnamnesisError';
  }
}
