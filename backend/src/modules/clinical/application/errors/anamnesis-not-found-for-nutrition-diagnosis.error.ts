import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisNotFoundForClinicalObjectiveError extends ApplicationError {
  readonly code = 'ANAMNESIS_NOT_FOUND_FOR_CLINICAL_OBJECTIVE' as const;

  constructor(readonly tenantId: string, readonly anamnesisId: string) {
    super(
      `Anamnesis with id "${anamnesisId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'AnamnesisNotFoundForClinicalObjectiveError';
  }
}
