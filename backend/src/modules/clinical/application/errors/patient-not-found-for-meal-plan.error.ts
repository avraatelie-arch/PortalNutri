import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientNotFoundForMealPlanError extends ApplicationError {
  readonly code = 'PATIENT_NOT_FOUND_FOR_MEAL_PLAN' as const;

  constructor(readonly tenantId: string, readonly patientId: string) {
    super(
      `Patient with id "${patientId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'PatientNotFoundForMealPlanError';
  }
}
