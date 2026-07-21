import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalObjectiveAlreadyTerminalError extends ApplicationError {
  readonly code = 'CLINICAL_OBJECTIVE_ALREADY_TERMINAL' as const;

  constructor(readonly tenantId: string, readonly nutritionDiagnosisId: string) {
    super(
      `Clinical objective with id "${nutritionDiagnosisId}" is terminal and cannot be modified for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalObjectiveAlreadyTerminalError';
  }
}
