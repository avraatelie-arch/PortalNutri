import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalObjectiveNotActiveError extends ApplicationError {
  readonly code = 'CLINICAL_OBJECTIVE_NOT_ACTIVE' as const;

  constructor(readonly tenantId: string, readonly clinicalObjectiveId: string) {
    super(
      `Clinical objective with id "${clinicalObjectiveId}" is not in ACTIVE status for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalObjectiveNotActiveError';
  }
}
