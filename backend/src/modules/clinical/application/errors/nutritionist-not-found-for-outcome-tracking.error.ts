import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class NutritionistNotFoundForOutcomeTrackingError extends ApplicationError {
  readonly code = 'NUTRITIONIST_NOT_FOUND_FOR_OUTCOME_TRACKING' as const;

  constructor(readonly tenantId: string, readonly nutritionistId: string) {
    super(
      `Nutritionist with id "${nutritionistId}" was not found for outcome tracking in tenant "${tenantId}".`,
    );
    this.name = 'NutritionistNotFoundForOutcomeTrackingError';
  }
}
