import type { OutcomeTracking } from '../aggregates/outcome-tracking.aggregate.js';
import { OutcomeRecordingRequirementsNotMetDomainError } from '../errors/outcome-recording-requirements-not-met.domain-error.js';
import { OutcomeAssessmentValue } from '../value-objects/outcome-assessment.js';

export interface OutcomeRecordingPolicy {
  validate(tracking: OutcomeTracking): void;
}

export class DefaultOutcomeRecordingPolicy implements OutcomeRecordingPolicy {
  validate(tracking: OutcomeTracking): void {
    const assessment = tracking.getOutcomeAssessment();

    if (!assessment) {
      throw new OutcomeRecordingRequirementsNotMetDomainError();
    }

    if (
      assessment.toString() === OutcomeAssessmentValue.NotEvaluable
      && tracking.getProfessionalRationale().isEmpty()
    ) {
      throw new OutcomeRecordingRequirementsNotMetDomainError();
    }
  }
}
