import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnthropometricAssessmentTenantMismatchForBodyCompositionError extends ApplicationError {
  readonly code = 'ANTHROPOMETRIC_ASSESSMENT_TENANT_MISMATCH_FOR_BODY_COMPOSITION' as const;

  constructor(
    readonly tenantId: string,
    readonly anthropometricAssessmentId: string,
  ) {
    super(
      `Anthropometric assessment "${anthropometricAssessmentId}" does not belong to tenant "${tenantId}".`,
    );
    this.name = 'AnthropometricAssessmentTenantMismatchForBodyCompositionError';
  }
}
