import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class TenantInactiveForBodyCompositionError extends ApplicationError {
  readonly code = 'TENANT_INACTIVE_FOR_BODY_COMPOSITION' as const;

  constructor(readonly tenantId: string) {
    super(`Tenant "${tenantId}" is inactive.`);
    this.name = 'TenantInactiveForBodyCompositionError';
  }
}
