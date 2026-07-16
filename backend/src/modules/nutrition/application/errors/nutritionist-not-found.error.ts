import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class NutritionistNotFoundError extends ApplicationError {
  readonly code = 'NUTRITIONIST_NOT_FOUND' as const;

  constructor(readonly nutritionistId: string) {
    super(`Nutritionist with id "${nutritionistId}" was not found.`);
    this.name = 'NutritionistNotFoundError';
  }
}
