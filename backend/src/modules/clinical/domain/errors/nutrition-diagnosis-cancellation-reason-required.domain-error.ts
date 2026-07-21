import { DomainError } from './domain-error.js';

export class NutritionDiagnosisCancellationReasonRequiredDomainError extends DomainError {
  constructor() {
    super(
      'Cancellation reason is required when cancelling a confirmed nutrition diagnosis.',
    );
    this.name = 'NutritionDiagnosisCancellationReasonRequiredDomainError';
  }
}
