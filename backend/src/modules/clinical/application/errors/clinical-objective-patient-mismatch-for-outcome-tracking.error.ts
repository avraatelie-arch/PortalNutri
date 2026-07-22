import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalObjectivePatientMismatchForOutcomeTrackingError extends ApplicationError {
  readonly code = 'CLINICAL_OBJECTIVE_PATIENT_MISMATCH_FOR_OUTCOME_TRACKING' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalObjectiveId: string,
    readonly patientId: string,
  ) {
    super(
      `Clinical objective with id "${clinicalObjectiveId}" does not belong to patient "${patientId}" for outcome tracking in tenant "${tenantId}".`,
    );
    this.name = 'ClinicalObjectivePatientMismatchForOutcomeTrackingError';
  }
}
