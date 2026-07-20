import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisNotDraftForAnthropometryError extends ApplicationError {
  readonly code = 'ANAMNESIS_NOT_DRAFT_FOR_ANTHROPOMETRY' as const;

  constructor(
    readonly tenantId: string,
    readonly anamnesisId: string,
  ) {
    super(
      `Anamnesis with id "${anamnesisId}" must be in DRAFT status for tenant "${tenantId}".`,
    );
    this.name = 'AnamnesisNotDraftForAnthropometryError';
  }
}
