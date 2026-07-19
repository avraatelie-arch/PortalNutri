import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterAlreadyOpenError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_ALREADY_OPEN' as const;

  constructor(
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
  ) {
    super(
      `An open clinical encounter already exists for patient "${patientId}" and nutritionist "${nutritionistId}" in tenant "${tenantId}".`,
    );
    this.name = 'ClinicalEncounterAlreadyOpenError';
  }
}
