import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisNotDraftForBodyCompositionError extends ApplicationError {
  readonly code = 'ANAMNESIS_NOT_DRAFT_FOR_BODY_COMPOSITION' as const;

  constructor(
    readonly tenantId: string,
    readonly anamnesisId: string,
  ) {
    super(
      `Anamnesis "${anamnesisId}" is not in DRAFT status for tenant "${tenantId}".`,
    );
    this.name = 'AnamnesisNotDraftForBodyCompositionError';
  }
}
