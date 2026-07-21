import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class MealPlanNotFoundError extends ApplicationError {
  readonly code = 'MEAL_PLAN_NOT_FOUND' as const;

  constructor(readonly tenantId: string, readonly mealPlanId: string) {
    super(
      `Meal plan with id "${mealPlanId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'MealPlanNotFoundError';
  }
}
