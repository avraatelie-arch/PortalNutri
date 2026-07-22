import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class OutcomeTrackingInvalidTransitionError extends ApplicationError {
  readonly code = 'OUTCOME_TRACKING_INVALID_TRANSITION' as const;

  constructor(readonly tenantId: string, readonly outcomeTrackingId: string) {
    super(
      `Outcome tracking with id "${outcomeTrackingId}" cannot transition for tenant "${tenantId}".`,
    );
    this.name = 'OutcomeTrackingInvalidTransitionError';
  }
}
