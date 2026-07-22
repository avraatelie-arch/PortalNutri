import { DomainError } from './domain-error.js';

export class OutcomeRecordingRequirementsNotMetDomainError extends DomainError {
  constructor() {
    super('Outcome tracking recording requirements are not met.');
    this.name = 'OutcomeRecordingRequirementsNotMetDomainError';
  }
}
