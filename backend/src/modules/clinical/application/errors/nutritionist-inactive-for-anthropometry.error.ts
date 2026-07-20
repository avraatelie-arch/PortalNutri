import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class NutritionistInactiveForAnthropometryError extends ApplicationError {
  readonly code = 'NUTRITIONIST_INACTIVE_FOR_ANTHROPOMETRY' as const;

  constructor(
    readonly tenantId: string,
    readonly nutritionistId: string,
  ) {
    super(
      `Nutritionist with id "${nutritionistId}" is inactive for tenant "${tenantId}".`,
    );
    this.name = 'NutritionistInactiveForAnthropometryError';
  }
}
