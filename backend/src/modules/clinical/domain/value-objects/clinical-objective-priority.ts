import { DomainError } from '../errors/domain-error.js';

export const ClinicalObjectivePriorityValue = {
  Low: 'LOW',
  Medium: 'MEDIUM',
  High: 'HIGH',
  Critical: 'CRITICAL',
} as const;

export type ClinicalObjectivePriority =
  (typeof ClinicalObjectivePriorityValue)[keyof typeof ClinicalObjectivePriorityValue];

export function parseClinicalObjectivePriority(
  value: string,
): ClinicalObjectivePriority {
  const normalized = value?.trim().toUpperCase();

  if (
    !Object.values(ClinicalObjectivePriorityValue).includes(
      normalized as ClinicalObjectivePriority,
    )
  ) {
    throw new DomainError(`Invalid clinical objective priority: ${value}.`);
  }

  return normalized as ClinicalObjectivePriority;
}

export function clinicalObjectivePrioritySortWeight(
  priority: ClinicalObjectivePriority,
): number {
  switch (priority) {
    case ClinicalObjectivePriorityValue.Low:
      return 1;
    case ClinicalObjectivePriorityValue.Medium:
      return 2;
    case ClinicalObjectivePriorityValue.High:
      return 3;
    case ClinicalObjectivePriorityValue.Critical:
      return 4;
    default:
      throw new DomainError(`Invalid clinical objective priority: ${priority}.`);
  }
}
