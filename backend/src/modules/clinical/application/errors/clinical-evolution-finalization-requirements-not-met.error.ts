import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEvolutionFinalizationRequirementsNotMetError extends ApplicationError {
  readonly code = 'CLINICAL_EVOLUTION_FINALIZATION_REQUIREMENTS_NOT_MET' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalEvolutionId: string,
  ) {
    super(
      `Clinical evolution with id "${clinicalEvolutionId}" does not meet finalization requirements for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEvolutionFinalizationRequirementsNotMetError';
  }
}
