import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class MealPlanInvalidTransitionError extends ApplicationError {
  readonly code = 'MEAL_PLAN_INVALID_TRANSITION' as const;

  constructor(readonly tenantId: string, readonly mealPlanId: string) {
    super(
      `Invalid meal plan transition for id "${mealPlanId}" in tenant "${tenantId}".`,
    );
    this.name = 'MealPlanInvalidTransitionError';
  }
}
