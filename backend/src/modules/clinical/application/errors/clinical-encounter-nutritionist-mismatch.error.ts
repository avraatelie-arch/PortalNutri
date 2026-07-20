import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterNutritionistMismatchError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_NUTRITIONIST_MISMATCH' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
    readonly nutritionistId: string,
  ) {
    super(
      `Clinical encounter "${clinicalEncounterId}" does not match nutritionist "${nutritionistId}" for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterNutritionistMismatchError';
  }
}
