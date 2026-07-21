import { ApplicationError } from '../../../iam/application/errors/application-error.js';

export class ClinicalObjectiveTitleRequiredForActivationError extends ApplicationError {
  readonly code = 'CLINICAL_OBJECTIVE_TITLE_REQUIRED_FOR_ACTIVATION' as const;

  constructor(readonly tenantId: string, readonly clinicalObjectiveId: string) {
    super(
      `Clinical objective with id "${clinicalObjectiveId}" requires a title before activation for tenant "${tenantId}".`,
    );
    this.name = 'ClinicalObjectiveTitleRequiredForActivationError';
  }
}
