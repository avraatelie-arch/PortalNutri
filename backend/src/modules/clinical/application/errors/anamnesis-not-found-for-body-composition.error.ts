import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisNotFoundForBodyCompositionError extends ApplicationError {
  readonly code = 'ANAMNESIS_NOT_FOUND_FOR_BODY_COMPOSITION' as const;

  constructor(
    readonly tenantId: string,
    readonly anamnesisId: string,
  ) {
    super(
      `Anamnesis "${anamnesisId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'AnamnesisNotFoundForBodyCompositionError';
  }
}
