import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientNutritionistAssignmentRoleMismatchError extends ApplicationError {
  readonly code = 'PATIENT_NUTRITIONIST_ASSIGNMENT_ROLE_MISMATCH' as const;

  constructor(
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    readonly storedRole: string,
    readonly requestedRole: string,
  ) {
    super(
      `Assignment role mismatch for patient "${patientId}" and nutritionist "${nutritionistId}" in tenant "${tenantId}". Stored role is "${storedRole}" but requested role is "${requestedRole}".`,
    );
    this.name = 'PatientNutritionistAssignmentRoleMismatchError';
  }
}
