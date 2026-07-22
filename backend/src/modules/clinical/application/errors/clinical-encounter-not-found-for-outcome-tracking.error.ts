import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterNotFoundForOutcomeTrackingError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_NOT_FOUND_FOR_OUTCOME_TRACKING' as const;

  constructor(readonly tenantId: string, readonly clinicalEncounterId: string) {
    super(
      `Clinical encounter with id "${clinicalEncounterId}" was not found for outcome tracking in tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterNotFoundForOutcomeTrackingError';
  }
}
