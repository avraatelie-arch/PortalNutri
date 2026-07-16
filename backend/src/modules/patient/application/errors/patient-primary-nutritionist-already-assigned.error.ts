import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientPrimaryNutritionistAlreadyAssignedError extends ApplicationError {
  readonly code = 'PATIENT_PRIMARY_NUTRITIONIST_ALREADY_ASSIGNED' as const;

  constructor(
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
  ) {
    super(
      `Patient "${patientId}" in tenant "${tenantId}" already has an active primary nutritionist. Cannot assign nutritionist "${nutritionistId}" as primary.`,
    );
    this.name = 'PatientPrimaryNutritionistAlreadyAssignedError';
  }
}
