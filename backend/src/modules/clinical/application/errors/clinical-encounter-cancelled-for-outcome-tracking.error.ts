import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterCancelledForOutcomeTrackingError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_CANCELLED_FOR_OUTCOME_TRACKING' as const;

  constructor(readonly tenantId: string, readonly clinicalEncounterId: string) {
    super(
      `Clinical encounter with id "${clinicalEncounterId}" is cancelled and cannot be used for outcome tracking in tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterCancelledForOutcomeTrackingError';
  }
}
