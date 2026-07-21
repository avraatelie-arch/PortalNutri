import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalObjectiveInvalidTransitionError extends ApplicationError {
  readonly code = 'CLINICAL_OBJECTIVE_INVALID_TRANSITION' as const;

  constructor(readonly tenantId: string, readonly clinicalObjectiveId: string) {
    super(
      `Clinical objective with id "${clinicalObjectiveId}" cannot transition in its current state for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalObjectiveInvalidTransitionError';
  }
}
