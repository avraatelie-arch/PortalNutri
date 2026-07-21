import { DomainError } from './domain-error.js';

export class MealPlanTitleRequiredDomainError extends DomainError {
  constructor() {
    super('Meal plan title is required for activation.');
    this.name = 'MealPlanTitleRequiredDomainError';
  }
}
