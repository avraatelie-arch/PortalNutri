import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnthropometricAssessmentValidationError extends ApplicationError {
  readonly code = 'ANTHROPOMETRIC_ASSESSMENT_VALIDATION_ERROR' as const;

  constructor(message: string) {
    super(message);
    this.name = 'AnthropometricAssessmentValidationError';
  }
}
