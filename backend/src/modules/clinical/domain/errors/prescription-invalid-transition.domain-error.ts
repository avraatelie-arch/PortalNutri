import { DomainError } from './domain-error.js';

export class PrescriptionInvalidTransitionDomainError extends DomainError {
  constructor(readonly status: string, readonly action: string) {
    super(`Cannot ${action} prescription in status ${status}.`);
    this.name = 'PrescriptionInvalidTransitionDomainError';
  }
}
