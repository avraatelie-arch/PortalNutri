import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class NutritionDiagnosisCancellationReasonRequiredError extends ApplicationError {
  readonly code = 'NUTRITION_DIAGNOSIS_CANCELLATION_REASON_REQUIRED' as const;

  constructor(readonly tenantId: string, readonly nutritionDiagnosisId: string) {
    super(
      `Cancellation reason is required when cancelling confirmed nutrition diagnosis "${nutritionDiagnosisId}" for tenant "${tenantId}".`,
    );
    this.name = 'NutritionDiagnosisCancellationReasonRequiredError';
  }
}
