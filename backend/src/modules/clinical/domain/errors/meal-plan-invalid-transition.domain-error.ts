import { DomainError } from './domain-error.js';
import type { MealPlanStatus } from '../value-objects/meal-plan-status.js';

export class MealPlanInvalidTransitionDomainError extends DomainError {
  constructor(
    readonly status: MealPlanStatus,
    readonly action: string,
  ) {
    super(
      `Meal plan in status "${status}" cannot perform action "${action}".`,
    );
    this.name = 'MealPlanInvalidTransitionDomainError';
  }
}
