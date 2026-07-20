import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterNotOpenForAnamnesisError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_NOT_OPEN_FOR_ANAMNESIS' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
  ) {
    super(
      `Clinical encounter with id "${clinicalEncounterId}" is not open for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterNotOpenForAnamnesisError';
  }
}
