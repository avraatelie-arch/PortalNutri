import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisAlreadyExistsForEncounterError extends ApplicationError {
  readonly code = 'ANAMNESIS_ALREADY_EXISTS_FOR_ENCOUNTER' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
  ) {
    super(
      `Anamnesis already exists for clinical encounter "${clinicalEncounterId}" in tenant "${tenantId}".`,
    );
    this.name = 'AnamnesisAlreadyExistsForEncounterError';
  }
}
