import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientInactiveForPrescriptionError extends ApplicationError {
  readonly code = 'PATIENT_INACTIVE_FOR_PRESCRIPTION' as const;
  constructor(readonly tenantId: string, readonly patientId: string) {
    super(`Patient with id "${patientId}" is inactive for tenant "${tenantId}".`);
    this.name = 'PatientInactiveForPrescriptionError';
  }
}
