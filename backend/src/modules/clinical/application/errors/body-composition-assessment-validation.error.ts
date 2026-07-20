import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class BodyCompositionAssessmentValidationError extends ApplicationError {
  readonly code = 'BODY_COMPOSITION_ASSESSMENT_VALIDATION_ERROR' as const;

  constructor(message: string) {
    super(message);
    this.name = 'BodyCompositionAssessmentValidationError';
  }
}
