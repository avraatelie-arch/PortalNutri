import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalEncounterValidationError extends ApplicationError {
  readonly code = 'CLINICAL_ENCOUNTER_VALIDATION_ERROR' as const;

  constructor(message: string) {
    super(message);
    this.name = 'ClinicalEncounterValidationError';
  }
}
