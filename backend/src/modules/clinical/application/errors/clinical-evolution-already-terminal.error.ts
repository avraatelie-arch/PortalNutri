import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEvolutionAlreadyTerminalError extends ApplicationError {
  readonly code = 'CLINICAL_EVOLUTION_ALREADY_TERMINAL' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalEvolutionId: string,
  ) {
    super(
      `Clinical evolution with id "${clinicalEvolutionId}" is in a terminal status for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEvolutionAlreadyTerminalError';
  }
}
