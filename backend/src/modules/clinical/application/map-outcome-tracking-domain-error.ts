import { OutcomeRecordingRequirementsNotMetDomainError } from '../domain/errors/outcome-recording-requirements-not-met.domain-error.js';
import { OutcomeTrackingInvalidTransitionDomainError } from '../domain/errors/outcome-tracking-invalid-transition.domain-error.js';
import { OutcomeTrackingNotDraftDomainError } from '../domain/errors/outcome-tracking-not-draft.domain-error.js';
import { OutcomeTrackingTerminalDomainError } from '../domain/errors/outcome-tracking-terminal.domain-error.js';
import { OutcomeTrackingAlreadyTerminalError } from './errors/outcome-tracking-already-terminal.error.js';
import { OutcomeTrackingInvalidTransitionError } from './errors/outcome-tracking-invalid-transition.error.js';
import { OutcomeTrackingNotDraftError } from './errors/outcome-tracking-not-draft.error.js';
import { OutcomeTrackingRecordingRequirementsNotMetError } from './errors/outcome-tracking-recording-requirements-not-met.error.js';

export type OutcomeTrackingMutationAction =
  | 'edit'
  | 'record'
  | 'cancel'
  | 'changeResponsibleNutritionist';

export function mapOutcomeTrackingDomainError(
  tenantId: string,
  outcomeTrackingId: string,
  action: OutcomeTrackingMutationAction,
  error: unknown,
): never {
  if (error instanceof OutcomeTrackingTerminalDomainError) {
    throw new OutcomeTrackingAlreadyTerminalError(tenantId, outcomeTrackingId);
  }

  if (error instanceof OutcomeRecordingRequirementsNotMetDomainError) {
    throw new OutcomeTrackingRecordingRequirementsNotMetError(
      tenantId,
      outcomeTrackingId,
    );
  }

  if (error instanceof OutcomeTrackingNotDraftDomainError) {
    throw new OutcomeTrackingNotDraftError(tenantId, outcomeTrackingId);
  }

  if (error instanceof OutcomeTrackingInvalidTransitionDomainError) {
    switch (action) {
      case 'edit':
      case 'record':
      case 'cancel':
        throw new OutcomeTrackingNotDraftError(tenantId, outcomeTrackingId);
      default:
        throw new OutcomeTrackingInvalidTransitionError(tenantId, outcomeTrackingId);
    }
  }

  throw error;
}
