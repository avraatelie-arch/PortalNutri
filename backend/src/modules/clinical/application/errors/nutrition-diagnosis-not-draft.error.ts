import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalObjectiveNotDraftError extends ApplicationError {
  readonly code = 'CLINICAL_OBJECTIVE_NOT_DRAFT' as const;

  constructor(readonly tenantId: string, readonly nutritionDiagnosisId: string) {
    super(
      `Clinical objective with id "${nutritionDiagnosisId}" is not in DRAFT status for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalObjectiveNotDraftError';
  }
}
