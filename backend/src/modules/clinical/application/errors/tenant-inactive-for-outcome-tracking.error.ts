import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class TenantInactiveForOutcomeTrackingError extends ApplicationError {
  readonly code = 'TENANT_INACTIVE_FOR_OUTCOME_TRACKING' as const;

  constructor(readonly tenantId: string) {
    super(`Tenant with id "${tenantId}" is inactive for outcome tracking.`);
    this.name = 'TenantInactiveForOutcomeTrackingError';
  }
}
