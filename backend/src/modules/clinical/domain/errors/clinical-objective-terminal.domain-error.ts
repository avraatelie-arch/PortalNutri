import { DomainError } from './domain-error.js';

export class ClinicalObjectiveTerminalDomainError extends DomainError {
  constructor(status: string) {
    super(`Clinical objective in status ${status} cannot be modified.`);
    this.name = 'ClinicalObjectiveTerminalDomainError';
  }
}
