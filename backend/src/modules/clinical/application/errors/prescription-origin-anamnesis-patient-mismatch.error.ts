import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PrescriptionOriginAnamnesisPatientMismatchError extends ApplicationError {
  readonly code = 'PRESCRIPTION_ORIGIN_ANAMNESIS_PATIENT_MISMATCH' as const;
  constructor(
    readonly tenantId: string,
    readonly anamnesisId: string,
    readonly patientId: string,
  ) {
    super(
      `Anamnesis with id "${anamnesisId}" does not belong to patient "${patientId}" for tenant "${tenantId}".`,
    );
    this.name = 'PrescriptionOriginAnamnesisPatientMismatchError';
  }
}
