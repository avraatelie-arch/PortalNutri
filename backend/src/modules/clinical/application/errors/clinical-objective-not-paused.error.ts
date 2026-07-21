import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalObjectiveNotPausedError extends ApplicationError {
  readonly code = 'CLINICAL_OBJECTIVE_NOT_PAUSED' as const;

  constructor(readonly tenantId: string, readonly clinicalObjectiveId: string) {
    super(
      `Clinical objective with id "${clinicalObjectiveId}" is not in PAUSED status for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalObjectiveNotPausedError';
  }
}
