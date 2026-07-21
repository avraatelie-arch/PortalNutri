import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class MealPlanActivationRequirementsNotMetError extends ApplicationError {
  readonly code = 'MEAL_PLAN_ACTIVATION_REQUIREMENTS_NOT_MET' as const;

  constructor(readonly tenantId: string, readonly mealPlanId: string) {
    super(
      `Meal plan with id "${mealPlanId}" does not meet activation requirements for tenant "${tenantId}".`,
    );
    this.name = 'MealPlanActivationRequirementsNotMetError';
  }
}
