import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class NutritionistInactiveForClinicalEvolutionError extends ApplicationError {
  readonly code = 'NUTRITIONIST_INACTIVE_FOR_CLINICAL_EVOLUTION' as const;

  constructor(readonly tenantId: string, readonly nutritionistId: string) {
    super(
      `Nutritionist with id "${nutritionistId}" is not active for tenant "${tenantId}".`,
    );
    this.name = 'NutritionistInactiveForClinicalEvolutionError';
  }
}
