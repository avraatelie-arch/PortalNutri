import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisNotFoundForOutcomeTrackingError extends ApplicationError {
  readonly code = 'ANAMNESIS_NOT_FOUND_FOR_OUTCOME_TRACKING' as const;

  constructor(readonly tenantId: string, readonly anamnesisId: string) {
    super(
      `Anamnesis with id "${anamnesisId}" was not found for outcome tracking in tenant "${tenantId}".`,
    );
    this.name = 'AnamnesisNotFoundForOutcomeTrackingError';
  }
}
