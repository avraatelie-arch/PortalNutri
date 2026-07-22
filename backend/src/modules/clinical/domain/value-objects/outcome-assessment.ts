import { DomainError } from '../errors/domain-error.js';

export const OutcomeAssessmentValue = {
  OnTrack: 'ON_TRACK',
  Partial: 'PARTIAL',
  Stable: 'STABLE',
  Stalled: 'STALLED',
  Regressed: 'REGRESSED',
  GoalAchieved: 'GOAL_ACHIEVED',
  NotEvaluable: 'NOT_EVALUABLE',
} as const;

export type OutcomeAssessmentValueType =
  (typeof OutcomeAssessmentValue)[keyof typeof OutcomeAssessmentValue];

export class OutcomeAssessment {
  private constructor(private readonly value: OutcomeAssessmentValueType) {}

  static parse(value: string): OutcomeAssessment {
    const normalized = value?.trim().toUpperCase();

    if (
      !Object.values(OutcomeAssessmentValue).includes(
        normalized as OutcomeAssessmentValueType,
      )
    ) {
      throw new DomainError(`Invalid outcome assessment: ${value}.`);
    }

    return new OutcomeAssessment(normalized as OutcomeAssessmentValueType);
  }

  toString(): OutcomeAssessmentValueType {
    return this.value;
  }

  equals(other: OutcomeAssessment): boolean {
    return this.value === other.value;
  }
}
