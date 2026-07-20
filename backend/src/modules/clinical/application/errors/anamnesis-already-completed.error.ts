import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisAlreadyCompletedError extends ApplicationError {
  readonly code = 'ANAMNESIS_ALREADY_COMPLETED' as const;

  constructor(
    readonly tenantId: string,
    readonly anamnesisId: string,
  ) {
    super(
      `Anamnesis with id "${anamnesisId}" is already completed for tenant "${tenantId}".`,
    );
    this.name = 'AnamnesisAlreadyCompletedError';
  }
}
