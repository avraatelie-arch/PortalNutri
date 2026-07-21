import { DomainError } from './domain-error.js';

export class MealPlanCancellationReasonRequiredDomainError extends DomainError {
  constructor() {
    super(
      'Cancellation reason is required when cancelling an active meal plan.',
    );
    this.name = 'MealPlanCancellationReasonRequiredDomainError';
  }
}
