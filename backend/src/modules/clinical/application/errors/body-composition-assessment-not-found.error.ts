import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class BodyCompositionAssessmentNotFoundError extends ApplicationError {
  readonly code = 'BODY_COMPOSITION_ASSESSMENT_NOT_FOUND' as const;

  constructor(
    readonly tenantId: string,
    readonly assessmentId: string,
  ) {
    super(
      `Body composition assessment "${assessmentId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'BodyCompositionAssessmentNotFoundError';
  }
}
