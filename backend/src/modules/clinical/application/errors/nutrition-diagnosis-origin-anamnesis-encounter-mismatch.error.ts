import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalObjectiveOriginAnamnesisEncounterMismatchError extends ApplicationError {
  readonly code = 'CLINICAL_OBJECTIVE_ORIGIN_ANAMNESIS_ENCOUNTER_MISMATCH' as const;

  constructor(readonly tenantId: string, readonly anamnesisId: string, readonly clinicalEncounterId: string) {
    super(
      `Anamnesis with id "${anamnesisId}" does not belong to clinical encounter "${clinicalEncounterId}" for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalObjectiveOriginAnamnesisEncounterMismatchError';
  }
}
