import type { ClinicalObjective } from '../../domain/aggregates/clinical-objective.aggregate.js';
import { clinicalObjectivePrioritySortWeight } from '../../domain/value-objects/clinical-objective-priority.js';

export function compareClinicalObjectivesByPriority(
  left: ClinicalObjective,
  right: ClinicalObjective,
): number {
  const priorityDiff =
    clinicalObjectivePrioritySortWeight(right.getPriority())
    - clinicalObjectivePrioritySortWeight(left.getPriority());

  if (priorityDiff !== 0) {
    return priorityDiff;
  }

  const createdAtDiff =
    right.getCreatedAt().getTime() - left.getCreatedAt().getTime();

  if (createdAtDiff !== 0) {
    return createdAtDiff;
  }

  return left.getId().toString().localeCompare(right.getId().toString());
}

export function sortClinicalObjectivesByPriority(
  objectives: ClinicalObjective[],
): ClinicalObjective[] {
  return [...objectives].sort(compareClinicalObjectivesByPriority);
}
