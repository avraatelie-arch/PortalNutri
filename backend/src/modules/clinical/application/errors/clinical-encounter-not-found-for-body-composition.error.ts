import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterNotFoundForBodyCompositionError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_NOT_FOUND_FOR_BODY_COMPOSITION' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
  ) {
    super(
      `Clinical encounter "${clinicalEncounterId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterNotFoundForBodyCompositionError';
  }
}
