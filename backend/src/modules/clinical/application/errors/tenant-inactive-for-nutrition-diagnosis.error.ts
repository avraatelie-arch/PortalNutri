import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class TenantInactiveForClinicalObjectiveError extends ApplicationError {
  readonly code = 'TENANT_INACTIVE_FOR_CLINICAL_OBJECTIVE' as const;

  constructor(readonly tenantId: string) {
    super(
      `Tenant with id "${tenantId}" is inactive.`,
    );
    this.name = 'TenantInactiveForClinicalObjectiveError';
  }
}
