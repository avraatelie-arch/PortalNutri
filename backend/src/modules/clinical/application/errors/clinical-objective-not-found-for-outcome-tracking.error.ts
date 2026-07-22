import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalObjectiveNotFoundForOutcomeTrackingError extends ApplicationError {
  readonly code = 'CLINICAL_OBJECTIVE_NOT_FOUND_FOR_OUTCOME_TRACKING' as const;

  constructor(readonly tenantId: string, readonly clinicalObjectiveId: string) {
    super(
      `Clinical objective with id "${clinicalObjectiveId}" was not found for outcome tracking in tenant "${tenantId}".`,
    );
    this.name = 'ClinicalObjectiveNotFoundForOutcomeTrackingError';
  }
}
