import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class PatientInactiveForMealPlanError extends ApplicationError {
  readonly code = 'PATIENT_INACTIVE_FOR_MEAL_PLAN' as const;

  constructor(readonly tenantId: string, readonly patientId: string) {
    super(
      `Patient with id "${patientId}" is inactive for tenant "${tenantId}".`,
    );
    this.name = 'PatientInactiveForMealPlanError';
  }
}
