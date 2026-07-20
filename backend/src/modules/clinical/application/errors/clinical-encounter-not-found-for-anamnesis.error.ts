import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterNotFoundForAnamnesisError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_NOT_FOUND_FOR_ANAMNESIS' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
  ) {
    super(
      `Clinical encounter with id "${clinicalEncounterId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterNotFoundForAnamnesisError';
  }
}
