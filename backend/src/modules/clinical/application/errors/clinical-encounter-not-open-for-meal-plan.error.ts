import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterNotOpenForMealPlanError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_NOT_OPEN_FOR_MEAL_PLAN' as const;

  constructor(readonly tenantId: string, readonly clinicalEncounterId: string) {
    super(
      `Clinical encounter with id "${clinicalEncounterId}" is not open for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterNotOpenForMealPlanError';
  }
}
