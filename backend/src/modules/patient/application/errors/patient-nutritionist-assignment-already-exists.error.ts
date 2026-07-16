import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientNutritionistAssignmentAlreadyExistsError extends ApplicationError {
  readonly code = 'PATIENT_NUTRITIONIST_ASSIGNMENT_ALREADY_EXISTS' as const;

  constructor(
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
  ) {
    super(
      `An active assignment already exists for patient "${patientId}" and nutritionist "${nutritionistId}" in tenant "${tenantId}".`,
    );
    this.name = 'PatientNutritionistAssignmentAlreadyExistsError';
  }
}
