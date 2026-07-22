import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class OutcomeTrackingAlreadyTerminalError extends ApplicationError {
  readonly code = 'OUTCOME_TRACKING_ALREADY_TERMINAL' as const;

  constructor(readonly tenantId: string, readonly outcomeTrackingId: string) {
    super(
      `Outcome tracking with id "${outcomeTrackingId}" is already terminal for tenant "${tenantId}".`,
    );
    this.name = 'OutcomeTrackingAlreadyTerminalError';
  }
}
