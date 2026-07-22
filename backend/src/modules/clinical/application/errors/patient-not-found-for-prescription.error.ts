import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientNotFoundForPrescriptionError extends ApplicationError {
  readonly code = 'PATIENT_NOT_FOUND_FOR_PRESCRIPTION' as const;
  constructor(readonly tenantId: string, readonly patientId: string) {
    super(`Patient with id "${patientId}" was not found for tenant "${tenantId}".`);
    this.name = 'PatientNotFoundForPrescriptionError';
  }
}
