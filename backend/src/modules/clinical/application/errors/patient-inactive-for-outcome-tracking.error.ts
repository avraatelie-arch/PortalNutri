import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientInactiveForOutcomeTrackingError extends ApplicationError {
  readonly code = 'PATIENT_INACTIVE_FOR_OUTCOME_TRACKING' as const;

  constructor(readonly tenantId: string, readonly patientId: string) {
    super(
      `Patient with id "${patientId}" is inactive for outcome tracking in tenant "${tenantId}".`,
    );
    this.name = 'PatientInactiveForOutcomeTrackingError';
  }
}
