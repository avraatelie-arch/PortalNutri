import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEvolutionAlreadyExistsForEncounterError extends ApplicationError {
  readonly code = 'CLINICAL_EVOLUTION_ALREADY_EXISTS_FOR_ENCOUNTER' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
  ) {
    super(
      `Clinical evolution already exists for encounter "${clinicalEncounterId}" in tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEvolutionAlreadyExistsForEncounterError';
  }
}
