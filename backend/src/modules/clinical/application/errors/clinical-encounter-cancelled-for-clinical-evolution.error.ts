import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterCancelledForClinicalEvolutionError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_CANCELLED_FOR_CLINICAL_EVOLUTION' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
  ) {
    super(
      `Clinical encounter with id "${clinicalEncounterId}" is cancelled and cannot finalize clinical evolution for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterCancelledForClinicalEvolutionError';
  }
}
