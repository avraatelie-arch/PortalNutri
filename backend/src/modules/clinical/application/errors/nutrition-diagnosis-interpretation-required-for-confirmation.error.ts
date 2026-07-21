import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalObjectiveInterpretationRequiredForConfirmationError extends ApplicationError {
  readonly code = 'CLINICAL_OBJECTIVE_INTERPRETATION_REQUIRED_FOR_CONFIRMATION' as const;

  constructor(readonly tenantId: string, readonly nutritionDiagnosisId: string) {
    super(
      `Clinical objective with id "${nutritionDiagnosisId}" requires a title before activation for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalObjectiveInterpretationRequiredForConfirmationError';
  }
}
