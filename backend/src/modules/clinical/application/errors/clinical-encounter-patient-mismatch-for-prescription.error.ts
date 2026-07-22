import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterPatientMismatchForPrescriptionError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_PATIENT_MISMATCH_FOR_PRESCRIPTION' as const;
  constructor(
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
    readonly patientId: string,
  ) {
    super(
      `Clinical encounter with id "${clinicalEncounterId}" does not belong to patient "${patientId}" for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterPatientMismatchForPrescriptionError';
  }
}
