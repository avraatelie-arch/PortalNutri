import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class TenantNotFoundForOutcomeTrackingError extends ApplicationError {
  readonly code = 'TENANT_NOT_FOUND_FOR_OUTCOME_TRACKING' as const;

  constructor(readonly tenantId: string) {
    super(`Tenant with id "${tenantId}" was not found for outcome tracking.`);
    this.name = 'TenantNotFoundForOutcomeTrackingError';
  }
}
