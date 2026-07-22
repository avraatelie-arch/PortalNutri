import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class OutcomeTrackingRecordingRequirementsNotMetError extends ApplicationError {
  readonly code = 'OUTCOME_TRACKING_RECORDING_REQUIREMENTS_NOT_MET' as const;

  constructor(readonly tenantId: string, readonly outcomeTrackingId: string) {
    super(
      `Outcome tracking with id "${outcomeTrackingId}" does not meet recording requirements for tenant "${tenantId}".`,
    );
    this.name = 'OutcomeTrackingRecordingRequirementsNotMetError';
  }
}
