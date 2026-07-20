import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisTenantMismatchError extends ApplicationError {
  readonly code = 'ANAMNESIS_TENANT_MISMATCH' as const;

  constructor(
    readonly tenantId: string,
    readonly anamnesisId: string,
  ) {
    super(
      `Anamnesis with id "${anamnesisId}" does not belong to tenant "${tenantId}".`,
    );
    this.name = 'AnamnesisTenantMismatchError';
  }
}
