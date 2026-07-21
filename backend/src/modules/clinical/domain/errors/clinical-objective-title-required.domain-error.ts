import { DomainError } from './domain-error.js';

export class ClinicalObjectiveTitleRequiredDomainError extends DomainError {
  constructor() {
    super('Clinical objective title is required for activation.');
    this.name = 'ClinicalObjectiveTitleRequiredDomainError';
  }
}
