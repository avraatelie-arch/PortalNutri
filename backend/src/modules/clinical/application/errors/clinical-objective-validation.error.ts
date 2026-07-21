import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalObjectiveValidationError extends ApplicationError {
  readonly code = 'CLINICAL_OBJECTIVE_VALIDATION_ERROR' as const;

  constructor(message: string) {
    super(message);
    this.name = 'ClinicalObjectiveValidationError';
  }
}
