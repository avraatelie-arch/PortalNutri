import { DomainError } from './domain-error.js';

export class OutcomeTrackingTerminalDomainError extends DomainError {
  constructor(readonly status: string) {
    super(`Outcome tracking in terminal status ${status} cannot be mutated.`);
    this.name = 'OutcomeTrackingTerminalDomainError';
  }
}
