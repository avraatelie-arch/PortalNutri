import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterNotOpenForAnthropometryError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_NOT_OPEN_FOR_ANTHROPOMETRY' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
  ) {
    super(
      `Clinical encounter with id "${clinicalEncounterId}" must be OPEN for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterNotOpenForAnthropometryError';
  }
}
