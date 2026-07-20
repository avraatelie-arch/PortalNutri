import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnamnesisNutritionistMismatchForBodyCompositionError extends ApplicationError {
  readonly code = 'ANAMNESIS_NUTRITIONIST_MISMATCH_FOR_BODY_COMPOSITION' as const;

  constructor(
    readonly tenantId: string,
    readonly anamnesisId: string,
    readonly nutritionistId: string,
  ) {
    super(
      `Anamnesis "${anamnesisId}" does not belong to nutritionist "${nutritionistId}" for tenant "${tenantId}".`,
    );
    this.name = 'AnamnesisNutritionistMismatchForBodyCompositionError';
  }
}
