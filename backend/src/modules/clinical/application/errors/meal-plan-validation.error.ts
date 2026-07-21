import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class MealPlanValidationError extends ApplicationError {
  readonly code = 'MEAL_PLAN_VALIDATION_ERROR' as const;

  constructor(message: string) {
    super(message);
    this.name = 'MealPlanValidationError';
  }
}
