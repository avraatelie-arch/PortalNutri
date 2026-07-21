import { DomainError } from './domain-error.js';

export class ClinicalObjectiveTargetDateInvalidDomainError extends DomainError {
  constructor() {
    super('Clinical objective target date must not be before activation date.');
    this.name = 'ClinicalObjectiveTargetDateInvalidDomainError';
  }
}
