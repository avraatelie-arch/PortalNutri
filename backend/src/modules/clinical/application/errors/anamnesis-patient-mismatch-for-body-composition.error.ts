import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisPatientMismatchForBodyCompositionError extends ApplicationError {
  readonly code = 'ANAMNESIS_PATIENT_MISMATCH_FOR_BODY_COMPOSITION' as const;

  constructor(
    readonly tenantId: string,
    readonly anamnesisId: string,
    readonly patientId: string,
  ) {
    super(
      `Anamnesis "${anamnesisId}" does not belong to patient "${patientId}" for tenant "${tenantId}".`,
    );
    this.name = 'AnamnesisPatientMismatchForBodyCompositionError';
  }
}
