import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterNotOpenForBodyCompositionError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_NOT_OPEN_FOR_BODY_COMPOSITION' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
  ) {
    super(
      `Clinical encounter "${clinicalEncounterId}" is not OPEN for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterNotOpenForBodyCompositionError';
  }
}
