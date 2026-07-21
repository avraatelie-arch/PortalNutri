import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class NutritionistInactiveForClinicalObjectiveError extends ApplicationError {
  readonly code = 'NUTRITIONIST_INACTIVE_FOR_CLINICAL_OBJECTIVE' as const;

  constructor(readonly tenantId: string, readonly nutritionistId: string) {
    super(
      `Nutritionist with id "${nutritionistId}" is inactive for tenant "${tenantId}".`,
    );
    this.name = 'NutritionistInactiveForClinicalObjectiveError';
  }
}
