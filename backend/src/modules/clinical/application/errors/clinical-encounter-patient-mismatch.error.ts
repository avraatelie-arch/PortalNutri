import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterPatientMismatchError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_PATIENT_MISMATCH' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
    readonly patientId: string,
  ) {
    super(
      `Clinical encounter "${clinicalEncounterId}" does not match patient "${patientId}" for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterPatientMismatchError';
  }
}
