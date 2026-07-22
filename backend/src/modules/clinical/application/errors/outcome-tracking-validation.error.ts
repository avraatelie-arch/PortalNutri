import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class OutcomeTrackingValidationError extends ApplicationError {
  readonly code = 'OUTCOME_TRACKING_VALIDATION_ERROR' as const;

  constructor(message: string) {
    super(message);
    this.name = 'OutcomeTrackingValidationError';
  }
}
