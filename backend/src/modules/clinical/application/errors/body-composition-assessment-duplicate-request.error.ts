import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class BodyCompositionAssessmentDuplicateRequestError extends ApplicationError {
  readonly code = 'BODY_COMPOSITION_ASSESSMENT_DUPLICATE_REQUEST' as const;

  constructor(
    readonly tenantId: string,
    readonly sourceRequestId: string,
  ) {
    super(
      `Body composition assessment with source request id "${sourceRequestId}" already exists for tenant "${tenantId}".`,
    );
    this.name = 'BodyCompositionAssessmentDuplicateRequestError';
  }
}
