import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class MealPlanCancellationReasonRequiredError extends ApplicationError {
  readonly code = 'MEAL_PLAN_CANCELLATION_REASON_REQUIRED' as const;

  constructor(readonly tenantId: string, readonly mealPlanId: string) {
    super(
      `Cancellation reason is required when cancelling active meal plan "${mealPlanId}" for tenant "${tenantId}".`,
    );
    this.name = 'MealPlanCancellationReasonRequiredError';
  }
}
