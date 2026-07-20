import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisNotFoundError extends ApplicationError {
  readonly code = 'ANAMNESIS_NOT_FOUND' as const;

  constructor(
    readonly tenantId: string,
    readonly anamnesisId: string,
  ) {
    super(
      `Anamnesis with id "${anamnesisId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'AnamnesisNotFoundError';
  }
}
