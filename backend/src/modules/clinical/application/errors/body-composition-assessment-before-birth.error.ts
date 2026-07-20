import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class BodyCompositionAssessmentBeforeBirthError extends ApplicationError {
  readonly code = 'BODY_COMPOSITION_ASSESSMENT_BEFORE_BIRTH' as const;

  constructor(
    readonly tenantId: string,
    readonly patientId: string,
  ) {
    super(
      `Measured at timestamp cannot be before patient birth date for patient "${patientId}" in tenant "${tenantId}".`,
    );
    this.name = 'BodyCompositionAssessmentBeforeBirthError';
  }
}
