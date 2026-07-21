import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class MealPlanNotDraftError extends ApplicationError {
  readonly code = 'MEAL_PLAN_NOT_DRAFT' as const;

  constructor(readonly tenantId: string, readonly mealPlanId: string) {
    super(
      `Meal plan with id "${mealPlanId}" is not in DRAFT status for tenant "${tenantId}".`,
    );
    this.name = 'MealPlanNotDraftError';
  }
}
