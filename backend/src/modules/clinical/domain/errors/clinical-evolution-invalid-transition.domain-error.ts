import { DomainError } from './domain-error.js';

export class ClinicalEvolutionInvalidTransitionDomainError extends DomainError {
  constructor(readonly status: string, readonly action: string) {
    super(`Cannot ${action} clinical evolution in status ${status}.`);
    this.name = 'ClinicalEvolutionInvalidTransitionDomainError';
  }
}
