import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class NutritionistValidationError extends ApplicationError {
  readonly code = 'NUTRITIONIST_VALIDATION_FAILED' as const;

  constructor(message: string) {
    super(message);
    this.name = 'NutritionistValidationError';
  }
}
