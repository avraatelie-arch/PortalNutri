import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisNotFoundForPrescriptionError extends ApplicationError {
  readonly code = 'ANAMNESIS_NOT_FOUND_FOR_PRESCRIPTION' as const;
  constructor(readonly tenantId: string, readonly anamnesisId: string) {
    super(`Anamnesis with id "${anamnesisId}" was not found for tenant "${tenantId}".`);
    this.name = 'AnamnesisNotFoundForPrescriptionError';
  }
}
