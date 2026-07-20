import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnthropometricAssessmentAnamnesisMismatchForBodyCompositionError extends ApplicationError {
  readonly code = 'ANTHROPOMETRIC_ASSESSMENT_ANAMNESIS_MISMATCH_FOR_BODY_COMPOSITION' as const;

  constructor(
    readonly tenantId: string,
    readonly anthropometricAssessmentId: string,
    readonly anamnesisId: string,
  ) {
    super(
      `Anthropometric assessment "${anthropometricAssessmentId}" does not belong to anamnesis "${anamnesisId}" for tenant "${tenantId}".`,
    );
    this.name = 'AnthropometricAssessmentAnamnesisMismatchForBodyCompositionError';
  }
}
