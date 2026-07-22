import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class NutritionistInactiveForOutcomeTrackingError extends ApplicationError {
  readonly code = 'NUTRITIONIST_INACTIVE_FOR_OUTCOME_TRACKING' as const;

  constructor(readonly tenantId: string, readonly nutritionistId: string) {
    super(
      `Nutritionist with id "${nutritionistId}" is inactive for outcome tracking in tenant "${tenantId}".`,
    );
    this.name = 'NutritionistInactiveForOutcomeTrackingError';
  }
}
