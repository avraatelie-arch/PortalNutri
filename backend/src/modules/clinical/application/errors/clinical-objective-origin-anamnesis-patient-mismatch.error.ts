import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalObjectiveOriginAnamnesisPatientMismatchError extends ApplicationError {
  readonly code = 'CLINICAL_OBJECTIVE_ORIGIN_ANAMNESIS_PATIENT_MISMATCH' as const;

  constructor(readonly tenantId: string, readonly anamnesisId: string, readonly patientId: string) {
    super(
      `Anamnesis with id "${anamnesisId}" does not belong to patient "${patientId}" for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalObjectiveOriginAnamnesisPatientMismatchError';
  }
}
