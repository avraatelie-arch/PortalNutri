import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class NutritionistNotFoundForEncounterError extends ApplicationError {
  readonly code = 'NUTRITIONIST_NOT_FOUND_FOR_ENCOUNTER' as const;

  constructor(readonly nutritionistId: string) {
    super(`Nutritionist with id "${nutritionistId}" was not found.`);
    this.name = 'NutritionistNotFoundForEncounterError';
  }
}
