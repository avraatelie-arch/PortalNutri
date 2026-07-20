import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisIncompleteError extends ApplicationError {
  readonly code = 'ANAMNESIS_INCOMPLETE' as const;

  constructor(
    readonly tenantId: string,
    readonly anamnesisId: string,
  ) {
    super(
      `Anamnesis with id "${anamnesisId}" cannot be completed for tenant "${tenantId}".`,
    );
    this.name = 'AnamnesisIncompleteError';
  }
}
