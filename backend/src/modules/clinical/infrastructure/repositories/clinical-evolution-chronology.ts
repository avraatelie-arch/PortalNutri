import type { ClinicalEvolution } from '../../domain/aggregates/clinical-evolution.aggregate.js';

export interface ClinicalEvolutionChronologySortable {
  getClinicalMomentAt(): Date;
  getClinicalEncounterId(): string;
  getFinalizedAt(): Date | null;
  getCreatedAt(): Date;
  getId(): { toString(): string };
}

function compareChronologyKeys(
  left: ClinicalEvolutionChronologySortable,
  right: ClinicalEvolutionChronologySortable,
): number {
  const momentDiff =
    right.getClinicalMomentAt().getTime() - left.getClinicalMomentAt().getTime();

  if (momentDiff !== 0) {
    return momentDiff;
  }

  const encounterDiff = right
    .getClinicalEncounterId()
    .localeCompare(left.getClinicalEncounterId());

  if (encounterDiff !== 0) {
    return encounterDiff;
  }

  const leftFinalized = left.getFinalizedAt()?.getTime() ?? 0;
  const rightFinalized = right.getFinalizedAt()?.getTime() ?? 0;
  const finalizedDiff = rightFinalized - leftFinalized;

  if (finalizedDiff !== 0) {
    return finalizedDiff;
  }

  const createdAtDiff =
    right.getCreatedAt().getTime() - left.getCreatedAt().getTime();

  if (createdAtDiff !== 0) {
    return createdAtDiff;
  }

  return left.getId().toString().localeCompare(right.getId().toString());
}

export function compareClinicalEvolutionChronology(
  left: ClinicalEvolutionChronologySortable,
  right: ClinicalEvolutionChronologySortable,
): number {
  return compareChronologyKeys(left, right);
}

export function sortClinicalEvolutionsByChronology<T extends ClinicalEvolutionChronologySortable>(
  items: T[],
): T[] {
  return [...items].sort(compareClinicalEvolutionChronology);
}

export function isStrictlyBeforeClinicalChronology(
  candidate: ClinicalEvolutionChronologySortable,
  current: Pick<
    ClinicalEvolutionChronologySortable,
    'getClinicalMomentAt' | 'getClinicalEncounterId'
  >,
): boolean {
  const candidateMoment = candidate.getClinicalMomentAt().getTime();
  const currentMoment = current.getClinicalMomentAt().getTime();

  if (candidateMoment !== currentMoment) {
    return candidateMoment < currentMoment;
  }

  return (
    candidate.getClinicalEncounterId().localeCompare(current.getClinicalEncounterId()) < 0
  );
}

export function findPreviousFinalizedBeforeChronology(
  evolutions: ClinicalEvolution[],
  currentClinicalMomentAt: Date,
  currentClinicalEncounterId: string,
  excludeEvolutionId?: string,
): ClinicalEvolution | null {
  const currentAnchor = {
    getClinicalMomentAt: () => currentClinicalMomentAt,
    getClinicalEncounterId: () => currentClinicalEncounterId,
  };

  const candidates = evolutions.filter((evolution) => {
    if (excludeEvolutionId && evolution.getId().toString() === excludeEvolutionId) {
      return false;
    }

    return isStrictlyBeforeClinicalChronology(evolution, currentAnchor);
  });

  const sorted = sortClinicalEvolutionsByChronology(candidates);
  return sorted[0] ?? null;
}

export function findPreviousFinalizedByChronology(
  evolutions: ClinicalEvolution[],
  current: ClinicalEvolution,
): ClinicalEvolution | null {
  return findPreviousFinalizedBeforeChronology(
    evolutions,
    current.getClinicalMomentAt(),
    current.getClinicalEncounterId(),
    current.getId().toString(),
  );
}

export function findLatestFinalizedByChronology(
  evolutions: ClinicalEvolution[],
): ClinicalEvolution | null {
  const sorted = sortClinicalEvolutionsByChronology(evolutions);
  return sorted[0] ?? null;
}
