import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class TenantInactiveForPrescriptionError extends ApplicationError {
  readonly code = 'TENANT_INACTIVE_FOR_PRESCRIPTION' as const;
  constructor(readonly tenantId: string) {
    super(`Tenant with id "${tenantId}" is inactive.`);
    this.name = 'TenantInactiveForPrescriptionError';
  }
}
