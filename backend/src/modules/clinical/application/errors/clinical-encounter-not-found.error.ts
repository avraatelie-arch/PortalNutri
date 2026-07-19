import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterNotFoundError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_NOT_FOUND' as const;

  constructor(
    readonly tenantId: string,
    readonly encounterId: string,
  ) {
    super(
      `Clinical encounter with id "${encounterId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterNotFoundError';
  }
}
