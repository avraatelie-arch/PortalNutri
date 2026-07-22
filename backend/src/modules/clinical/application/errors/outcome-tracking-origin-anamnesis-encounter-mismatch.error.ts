import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class OutcomeTrackingOriginAnamnesisEncounterMismatchError extends ApplicationError {
  readonly code = 'OUTCOME_TRACKING_ORIGIN_ANAMNESIS_ENCOUNTER_MISMATCH' as const;

  constructor(
    readonly tenantId: string,
    readonly anamnesisId: string,
    readonly clinicalEncounterId: string,
  ) {
    super(
      `Anamnesis with id "${anamnesisId}" does not belong to clinical encounter "${clinicalEncounterId}" for outcome tracking in tenant "${tenantId}".`,
    );
    this.name = 'OutcomeTrackingOriginAnamnesisEncounterMismatchError';
  }
}
