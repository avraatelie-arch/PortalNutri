import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class TenantNotFoundForBodyCompositionError extends ApplicationError {
  readonly code = 'TENANT_NOT_FOUND_FOR_BODY_COMPOSITION' as const;

  constructor(readonly tenantId: string) {
    super(`Tenant with id "${tenantId}" was not found.`);
    this.name = 'TenantNotFoundForBodyCompositionError';
  }
}
