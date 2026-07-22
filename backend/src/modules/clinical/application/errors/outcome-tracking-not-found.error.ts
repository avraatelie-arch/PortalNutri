import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class OutcomeTrackingNotFoundError extends ApplicationError {
  readonly code = 'OUTCOME_TRACKING_NOT_FOUND' as const;

  constructor(readonly tenantId: string, readonly outcomeTrackingId: string) {
    super(
      `Outcome tracking with id "${outcomeTrackingId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'OutcomeTrackingNotFoundError';
  }
}
