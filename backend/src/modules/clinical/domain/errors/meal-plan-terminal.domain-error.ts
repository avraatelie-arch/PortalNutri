import { DomainError } from './domain-error.js';
import type { MealPlanStatus } from '../value-objects/meal-plan-status.js';

export class MealPlanTerminalDomainError extends DomainError {
  constructor(readonly status: MealPlanStatus) {
    super(`Meal plan in terminal status "${status}" cannot be modified.`);
    this.name = 'MealPlanTerminalDomainError';
  }
}
