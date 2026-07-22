import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterNutritionistMismatchForClinicalEvolutionError extends ApplicationError {
  readonly code =
    'CLINICAL_ENCOUNTER_NUTRITIONIST_MISMATCH_FOR_CLINICAL_EVOLUTION' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
    readonly nutritionistId: string,
  ) {
    super(
      `Clinical encounter "${clinicalEncounterId}" does not match nutritionist "${nutritionistId}" for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterNutritionistMismatchForClinicalEvolutionError';
  }
}
