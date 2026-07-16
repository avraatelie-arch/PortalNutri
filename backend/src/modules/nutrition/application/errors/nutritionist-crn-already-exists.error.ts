import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class NutritionistCrnAlreadyExistsError extends ApplicationError {
  readonly code = 'NUTRITIONIST_CRN_ALREADY_EXISTS' as const;

  constructor(
    readonly tenantId: string,
    readonly crn: string,
  ) {
    super(`CRN "${crn}" already exists for tenant "${tenantId}".`);
    this.name = 'NutritionistCrnAlreadyExistsError';
  }
}
