import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalObjectiveTargetDateInvalidError extends ApplicationError {
  readonly code = 'CLINICAL_OBJECTIVE_TARGET_DATE_INVALID' as const;

  constructor(readonly tenantId: string, readonly clinicalObjectiveId: string) {
    super(
      `Clinical objective with id "${clinicalObjectiveId}" has an invalid target date for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalObjectiveTargetDateInvalidError';
  }
}
