import { DomainError } from './domain-error.js';

export class OutcomeTrackingNotDraftDomainError extends DomainError {
  constructor(readonly status: string) {
    super(
      `Outcome tracking in status ${status} is not editable; only DRAFT content can be modified.`,
    );
    this.name = 'OutcomeTrackingNotDraftDomainError';
  }
}
