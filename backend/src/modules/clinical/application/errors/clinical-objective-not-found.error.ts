import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalObjectiveNotFoundError extends ApplicationError {
  readonly code = 'CLINICAL_OBJECTIVE_NOT_FOUND' as const;

  constructor(readonly tenantId: string, readonly clinicalObjectiveId: string) {
    super(
      `Clinical objective with id "${clinicalObjectiveId}" was not found for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalObjectiveNotFoundError';
  }
}
