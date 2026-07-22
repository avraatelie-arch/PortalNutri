import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class NutritionistNotFoundForClinicalEvolutionError extends ApplicationError {
  readonly code = 'NUTRITIONIST_NOT_FOUND_FOR_CLINICAL_EVOLUTION' as const;

  constructor(readonly tenantId: string, readonly nutritionistId: string) {
    super(
      `Nutritionist with id "${nutritionistId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'NutritionistNotFoundForClinicalEvolutionError';
  }
}
