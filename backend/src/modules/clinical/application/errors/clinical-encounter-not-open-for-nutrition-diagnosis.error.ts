import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterNotOpenForClinicalObjectiveError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_NOT_OPEN_FOR_CLINICAL_OBJECTIVE' as const;

  constructor(readonly tenantId: string, readonly clinicalEncounterId: string) {
    super(
      `Clinical encounter with id "${clinicalEncounterId}" is not open for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterNotOpenForClinicalObjectiveError';
  }
}
