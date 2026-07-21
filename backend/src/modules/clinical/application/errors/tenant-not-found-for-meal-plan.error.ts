import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class TenantNotFoundForMealPlanError extends ApplicationError {
  readonly code = 'TENANT_NOT_FOUND_FOR_MEAL_PLAN' as const;

  constructor(readonly tenantId: string) {
    super(
      `Tenant with id "${tenantId}" was not found.`,
    );
    this.name = 'TenantNotFoundForMealPlanError';
  }
}
