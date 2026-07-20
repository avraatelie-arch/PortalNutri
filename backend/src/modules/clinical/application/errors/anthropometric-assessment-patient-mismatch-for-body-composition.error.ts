import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class AnthropometricAssessmentPatientMismatchForBodyCompositionError extends ApplicationError {
  readonly code = 'ANTHROPOMETRIC_ASSESSMENT_PATIENT_MISMATCH_FOR_BODY_COMPOSITION' as const;

  constructor(
    readonly tenantId: string,
    readonly anthropometricAssessmentId: string,
    readonly patientId: string,
  ) {
    super(
      `Anthropometric assessment "${anthropometricAssessmentId}" does not belong to patient "${patientId}" for tenant "${tenantId}".`,
    );
    this.name = 'AnthropometricAssessmentPatientMismatchForBodyCompositionError';
  }
}
