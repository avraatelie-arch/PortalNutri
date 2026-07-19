import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class NutritionistInactiveForEncounterError extends ApplicationError {
  readonly code = 'NUTRITIONIST_INACTIVE_FOR_ENCOUNTER' as const;

  constructor(readonly nutritionistId: string) {
    super(`Nutritionist with id "${nutritionistId}" is inactive.`);
    this.name = 'NutritionistInactiveForEncounterError';
  }
}
