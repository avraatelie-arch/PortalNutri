import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnthropometricAssessmentNotFoundForBodyCompositionError extends ApplicationError {
  readonly code = 'ANTHROPOMETRIC_ASSESSMENT_NOT_FOUND_FOR_BODY_COMPOSITION' as const;

  constructor(
    readonly tenantId: string,
    readonly anthropometricAssessmentId: string,
  ) {
    super(
      `Anthropometric assessment "${anthropometricAssessmentId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'AnthropometricAssessmentNotFoundForBodyCompositionError';
  }
}
