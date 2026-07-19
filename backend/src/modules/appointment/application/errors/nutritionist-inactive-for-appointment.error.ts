import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class NutritionistInactiveForAppointmentError extends ApplicationError {
  readonly code = 'NUTRITIONIST_INACTIVE_FOR_APPOINTMENT' as const;

  constructor(readonly nutritionistId: string) {
    super(`Nutritionist with id "${nutritionistId}" is inactive.`);
    this.name = 'NutritionistInactiveForAppointmentError';
  }
}
