import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEvolutionNotFoundError extends ApplicationError {
  readonly code = 'CLINICAL_EVOLUTION_NOT_FOUND' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalEvolutionId: string,
  ) {
    super(
      `Clinical evolution with id "${clinicalEvolutionId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEvolutionNotFoundError';
  }
}
