import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PrescriptionOriginAnamnesisEncounterMismatchError extends ApplicationError {
  readonly code = 'PRESCRIPTION_ORIGIN_ANAMNESIS_ENCOUNTER_MISMATCH' as const;
  constructor(
    readonly tenantId: string,
    readonly anamnesisId: string,
    readonly clinicalEncounterId: string,
  ) {
    super(
      `Anamnesis with id "${anamnesisId}" does not belong to clinical encounter "${clinicalEncounterId}" for tenant "${tenantId}".`,
    );
    this.name = 'PrescriptionOriginAnamnesisEncounterMismatchError';
  }
}
