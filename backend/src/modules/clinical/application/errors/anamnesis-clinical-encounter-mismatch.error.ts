import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisClinicalEncounterMismatchError extends ApplicationError {
  readonly code = 'ANAMNESIS_CLINICAL_ENCOUNTER_MISMATCH' as const;

  constructor(
    readonly tenantId: string,
    readonly anamnesisId: string,
    readonly clinicalEncounterId: string,
  ) {
    super(
      `Anamnesis "${anamnesisId}" does not belong to clinical encounter "${clinicalEncounterId}" for tenant "${tenantId}".`,
    );
    this.name = 'AnamnesisClinicalEncounterMismatchError';
  }
}
