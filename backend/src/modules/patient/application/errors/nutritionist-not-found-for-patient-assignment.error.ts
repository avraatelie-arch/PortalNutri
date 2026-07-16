import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class NutritionistNotFoundForPatientAssignmentError extends ApplicationError {
  readonly code = 'NUTRITIONIST_NOT_FOUND_FOR_PATIENT_ASSIGNMENT' as const;

  constructor(readonly nutritionistId: string) {
    super(
      `Nutritionist with id "${nutritionistId}" was not found for patient assignment.`,
    );
    this.name = 'NutritionistNotFoundForPatientAssignmentError';
  }
}
