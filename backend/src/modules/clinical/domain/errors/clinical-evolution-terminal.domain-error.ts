import { DomainError } from './domain-error.js';

export class ClinicalEvolutionTerminalDomainError extends DomainError {
  constructor(readonly status: string) {
    super(`Clinical evolution in terminal status ${status} cannot be mutated.`);
    this.name = 'ClinicalEvolutionTerminalDomainError';
  }
}
