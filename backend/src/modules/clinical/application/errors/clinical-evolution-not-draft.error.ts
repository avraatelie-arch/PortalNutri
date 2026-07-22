import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEvolutionNotDraftError extends ApplicationError {
  readonly code = 'CLINICAL_EVOLUTION_NOT_DRAFT' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalEvolutionId: string,
  ) {
    super(
      `Clinical evolution with id "${clinicalEvolutionId}" is not in DRAFT status for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEvolutionNotDraftError';
  }
}
