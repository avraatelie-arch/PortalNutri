import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class BodyCompositionAssessmentFutureDateError extends ApplicationError {
  readonly code = 'BODY_COMPOSITION_ASSESSMENT_FUTURE_DATE' as const;

  constructor(
    readonly tenantId: string,
    readonly patientId: string,
  ) {
    super(
      `Measured at timestamp cannot be in the future for patient "${patientId}" in tenant "${tenantId}".`,
    );
    this.name = 'BodyCompositionAssessmentFutureDateError';
  }
}
