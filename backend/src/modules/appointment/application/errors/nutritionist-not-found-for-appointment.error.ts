import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class NutritionistNotFoundForAppointmentError extends ApplicationError {
  readonly code = 'NUTRITIONIST_NOT_FOUND_FOR_APPOINTMENT' as const;

  constructor(readonly nutritionistId: string) {
    super(
      `Nutritionist with id "${nutritionistId}" was not found for appointment.`,
    );
    this.name = 'NutritionistNotFoundForAppointmentError';
  }
}
