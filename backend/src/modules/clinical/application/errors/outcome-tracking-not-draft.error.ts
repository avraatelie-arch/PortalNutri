import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class OutcomeTrackingNotDraftError extends ApplicationError {
  readonly code = 'OUTCOME_TRACKING_NOT_DRAFT' as const;

  constructor(readonly tenantId: string, readonly outcomeTrackingId: string) {
    super(
      `Outcome tracking with id "${outcomeTrackingId}" is not in DRAFT status for tenant "${tenantId}".`,
    );
    this.name = 'OutcomeTrackingNotDraftError';
  }
}
