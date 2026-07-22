import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class OutcomeTrackingOriginAnamnesisPatientMismatchError extends ApplicationError {
  readonly code = 'OUTCOME_TRACKING_ORIGIN_ANAMNESIS_PATIENT_MISMATCH' as const;

  constructor(
    readonly tenantId: string,
    readonly anamnesisId: string,
    readonly patientId: string,
  ) {
    super(
      `Anamnesis with id "${anamnesisId}" does not belong to patient "${patientId}" for outcome tracking in tenant "${tenantId}".`,
    );
    this.name = 'OutcomeTrackingOriginAnamnesisPatientMismatchError';
  }
}
