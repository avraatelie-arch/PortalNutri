import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class NutritionistInactiveForPatientAssignmentError extends ApplicationError {
  readonly code = 'NUTRITIONIST_INACTIVE_FOR_PATIENT_ASSIGNMENT' as const;

  constructor(readonly nutritionistId: string) {
    super(
      `Nutritionist with id "${nutritionistId}" is inactive and cannot be assigned to a patient.`,
    );
    this.name = 'NutritionistInactiveForPatientAssignmentError';
  }
}
