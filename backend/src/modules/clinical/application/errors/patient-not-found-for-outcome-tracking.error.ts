import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientNotFoundForOutcomeTrackingError extends ApplicationError {
  readonly code = 'PATIENT_NOT_FOUND_FOR_OUTCOME_TRACKING' as const;

  constructor(readonly tenantId: string, readonly patientId: string) {
    super(
      `Patient with id "${patientId}" was not found for outcome tracking in tenant "${tenantId}".`,
    );
    this.name = 'PatientNotFoundForOutcomeTrackingError';
  }
}
