import { DomainError } from './domain-error.js';

export class PrescriptionCancellationReasonRequiredDomainError extends DomainError {
  constructor() {
    super('Cancellation reason is required when cancelling an issued prescription.');
    this.name = 'PrescriptionCancellationReasonRequiredDomainError';
  }
}
