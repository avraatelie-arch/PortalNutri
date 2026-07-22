import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEvolutionInvalidTransitionError extends ApplicationError {
  readonly code = 'CLINICAL_EVOLUTION_INVALID_TRANSITION' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalEvolutionId: string,
  ) {
    super(
      `Clinical evolution with id "${clinicalEvolutionId}" cannot transition for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEvolutionInvalidTransitionError';
  }
}
