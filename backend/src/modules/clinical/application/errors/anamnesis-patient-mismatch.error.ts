import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisPatientMismatchError extends ApplicationError {
  readonly code = 'ANAMNESIS_PATIENT_MISMATCH' as const;

  constructor(
    readonly tenantId: string,
    readonly anamnesisId: string,
    readonly patientId: string,
  ) {
    super(
      `Anamnesis "${anamnesisId}" does not belong to patient "${patientId}" for tenant "${tenantId}".`,
    );
    this.name = 'AnamnesisPatientMismatchError';
  }
}
