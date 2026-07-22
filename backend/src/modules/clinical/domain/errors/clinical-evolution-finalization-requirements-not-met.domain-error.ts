import { DomainError } from './domain-error.js';

export class ClinicalEvolutionFinalizationRequirementsNotMetDomainError extends DomainError {
  constructor() {
    super('Clinical evolution finalization requirements are not met.');
    this.name = 'ClinicalEvolutionFinalizationRequirementsNotMetDomainError';
  }
}
