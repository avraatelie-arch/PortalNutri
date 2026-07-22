import { ApplicationError } from '../../../iam/application/errors/application-error.js';
import type { ClinicalObjectiveStatus } from '../../domain/value-objects/clinical-objective-status.js';

export class ClinicalObjectiveNotAssessableForOutcomeTrackingError extends ApplicationError {
  readonly code = 'CLINICAL_OBJECTIVE_NOT_ASSESSABLE_FOR_OUTCOME_TRACKING' as const;

  constructor(
    readonly tenantId: string,
    readonly clinicalObjectiveId: string,
    readonly status: ClinicalObjectiveStatus,
  ) {
    super(
      `Clinical objective with id "${clinicalObjectiveId}" has status "${status}" and cannot be assessed for outcome tracking in tenant "${tenantId}".`,
    );
    this.name = 'ClinicalObjectiveNotAssessableForOutcomeTrackingError';
  }
}
