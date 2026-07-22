import { DomainError } from './domain-error.js';

export class ClinicalEvolutionNotDraftDomainError extends DomainError {
  constructor(readonly status: string) {
    super(`Clinical evolution in status ${status} is not editable; only DRAFT content can be modified.`);
    this.name = 'ClinicalEvolutionNotDraftDomainError';
  }
}
