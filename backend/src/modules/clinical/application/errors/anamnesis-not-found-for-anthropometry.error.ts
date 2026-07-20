import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisNotFoundForAnthropometryError extends ApplicationError {
  readonly code = 'ANAMNESIS_NOT_FOUND_FOR_ANTHROPOMETRY' as const;

  constructor(
    readonly tenantId: string,
    readonly anamnesisId: string,
  ) {
    super(
      `Anamnesis with id "${anamnesisId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'AnamnesisNotFoundForAnthropometryError';
  }
}
