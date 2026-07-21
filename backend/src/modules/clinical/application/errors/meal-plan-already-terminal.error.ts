import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class MealPlanAlreadyTerminalError extends ApplicationError {
  readonly code = 'MEAL_PLAN_ALREADY_TERMINAL' as const;

  constructor(readonly tenantId: string, readonly mealPlanId: string) {
    super(
      `Meal plan with id "${mealPlanId}" is in a terminal status for tenant "${tenantId}".`,
    );
    this.name = 'MealPlanAlreadyTerminalError';
  }
}
