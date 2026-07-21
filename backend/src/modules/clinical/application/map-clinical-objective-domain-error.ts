import { ClinicalObjectiveInvalidTransitionDomainError } from '../domain/errors/clinical-objective-invalid-transition.domain-error.js';
import { ClinicalObjectiveTerminalDomainError } from '../domain/errors/clinical-objective-terminal.domain-error.js';
import { ClinicalObjectiveTargetDateInvalidDomainError } from '../domain/errors/clinical-objective-target-date-invalid.domain-error.js';
import { ClinicalObjectiveTitleRequiredDomainError } from '../domain/errors/clinical-objective-title-required.domain-error.js';
import { ClinicalObjectiveAlreadyTerminalError } from './errors/clinical-objective-already-terminal.error.js';
import { ClinicalObjectiveInvalidTransitionError } from './errors/clinical-objective-invalid-transition.error.js';
import { ClinicalObjectiveNotActiveError } from './errors/clinical-objective-not-active.error.js';
import { ClinicalObjectiveNotDraftError } from './errors/clinical-objective-not-draft.error.js';
import { ClinicalObjectiveNotPausedError } from './errors/clinical-objective-not-paused.error.js';
import { ClinicalObjectiveTargetDateInvalidError } from './errors/clinical-objective-target-date-invalid.error.js';
import { ClinicalObjectiveTitleRequiredForActivationError } from './errors/clinical-objective-title-required-for-activation.error.js';

export type ClinicalObjectiveMutationAction =
  | 'activate'
  | 'pause'
  | 'resume'
  | 'complete'
  | 'cancel'
  | 'edit'
  | 'changeResponsibleNutritionist';

export function mapClinicalObjectiveDomainError(
  tenantId: string,
  clinicalObjectiveId: string,
  action: ClinicalObjectiveMutationAction,
  error: unknown,
): never {
  if (error instanceof ClinicalObjectiveTerminalDomainError) {
    throw new ClinicalObjectiveAlreadyTerminalError(tenantId, clinicalObjectiveId);
  }

  if (error instanceof ClinicalObjectiveTitleRequiredDomainError) {
    throw new ClinicalObjectiveTitleRequiredForActivationError(
      tenantId,
      clinicalObjectiveId,
    );
  }

  if (error instanceof ClinicalObjectiveTargetDateInvalidDomainError) {
    throw new ClinicalObjectiveTargetDateInvalidError(tenantId, clinicalObjectiveId);
  }

  if (error instanceof ClinicalObjectiveInvalidTransitionDomainError) {
    switch (action) {
      case 'activate':
        throw new ClinicalObjectiveNotDraftError(tenantId, clinicalObjectiveId);
      case 'pause':
      case 'complete':
        throw new ClinicalObjectiveNotActiveError(tenantId, clinicalObjectiveId);
      case 'resume':
        throw new ClinicalObjectiveNotPausedError(tenantId, clinicalObjectiveId);
      default:
        throw new ClinicalObjectiveInvalidTransitionError(tenantId, clinicalObjectiveId);
    }
  }

  throw error;
}
