import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnthropometricAssessmentNotFoundError extends ApplicationError {
  readonly code = 'ANTHROPOMETRIC_ASSESSMENT_NOT_FOUND' as const;

  constructor(
    readonly tenantId: string,
    readonly assessmentId: string,
  ) {
    super(
      `Anthropometric assessment with id "${assessmentId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'AnthropometricAssessmentNotFoundError';
  }
}
