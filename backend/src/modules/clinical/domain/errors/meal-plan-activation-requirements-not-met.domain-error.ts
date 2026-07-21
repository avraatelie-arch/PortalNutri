import { DomainError } from './domain-error.js';

export class MealPlanActivationRequirementsNotMetDomainError extends DomainError {
  constructor() {
    super(
      'Meal plan activation requires a non-empty title and either a non-empty therapeutic strategy or at least one meal with content.',
    );
    this.name = 'MealPlanActivationRequirementsNotMetDomainError';
  }
}
