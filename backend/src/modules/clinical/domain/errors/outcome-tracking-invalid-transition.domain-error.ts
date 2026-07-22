import { DomainError } from './domain-error.js';

export class OutcomeTrackingInvalidTransitionDomainError extends DomainError {
  constructor(readonly status: string, readonly action: string) {
    super(`Cannot ${action} outcome tracking in status ${status}.`);
    this.name = 'OutcomeTrackingInvalidTransitionDomainError';
  }
}
