import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnthropometricAssessmentDuplicateRequestError extends ApplicationError {
  readonly code = 'ANTHROPOMETRIC_ASSESSMENT_DUPLICATE_REQUEST' as const;

  constructor(
    readonly tenantId: string,
    readonly sourceRequestId: string,
  ) {
    super(
      `Anthropometric assessment with source request id "${sourceRequestId}" already exists for tenant "${tenantId}".`,
    );
    this.name = 'AnthropometricAssessmentDuplicateRequestError';
  }
}
