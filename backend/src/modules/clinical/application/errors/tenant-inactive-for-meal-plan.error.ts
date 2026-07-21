import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class TenantInactiveForMealPlanError extends ApplicationError {
  readonly code = 'TENANT_INACTIVE_FOR_MEAL_PLAN' as const;

  constructor(readonly tenantId: string) {
    super(
      `Tenant with id "${tenantId}" is inactive.`,
    );
    this.name = 'TenantInactiveForMealPlanError';
  }
}
