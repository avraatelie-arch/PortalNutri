import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientNotFoundForClinicalObjectiveError extends ApplicationError {
  readonly code = 'PATIENT_NOT_FOUND_FOR_CLINICAL_OBJECTIVE' as const;

  constructor(readonly tenantId: string, readonly patientId: string) {
    super(
      `Patient with id "${patientId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'PatientNotFoundForClinicalObjectiveError';
  }
}
