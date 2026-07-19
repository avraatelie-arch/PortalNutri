import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientNutritionistAssignmentRequiredError extends ApplicationError {
  readonly code = 'PATIENT_NUTRITIONIST_ASSIGNMENT_REQUIRED' as const;

  constructor(
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
  ) {
    super(
      `An active patient-nutritionist assignment is required for patient "${patientId}" and nutritionist "${nutritionistId}" in tenant "${tenantId}".`,
    );
    this.name = 'PatientNutritionistAssignmentRequiredError';
  }
}
