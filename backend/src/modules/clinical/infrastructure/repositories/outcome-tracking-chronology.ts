import type { OutcomeTracking } from '../../domain/aggregates/outcome-tracking.aggregate.js';

export interface OutcomeTrackingChronologySortable {
  getEvaluatedAt(): Date | null;
  getRecordedAt(): Date | null;
  getCreatedAt(): Date;
  getId(): { toString(): string };
}

function compareChronologyKeys(
  left: OutcomeTrackingChronologySortable,
  right: OutcomeTrackingChronologySortable,
): number {
  const leftEvaluated = left.getEvaluatedAt()?.getTime() ?? 0;
  const rightEvaluated = right.getEvaluatedAt()?.getTime() ?? 0;
  const evaluatedDiff = rightEvaluated - leftEvaluated;

  if (evaluatedDiff !== 0) {
    return evaluatedDiff;
  }

  const leftRecorded = left.getRecordedAt()?.getTime() ?? 0;
  const rightRecorded = right.getRecordedAt()?.getTime() ?? 0;
  const recordedDiff = rightRecorded - leftRecorded;

  if (recordedDiff !== 0) {
    return recordedDiff;
  }

  const createdAtDiff =
    right.getCreatedAt().getTime() - left.getCreatedAt().getTime();

  if (createdAtDiff !== 0) {
    return createdAtDiff;
  }

  return left.getId().toString().localeCompare(right.getId().toString());
}

export function compareOutcomeTrackingChronology(
  left: OutcomeTrackingChronologySortable,
  right: OutcomeTrackingChronologySortable,
): number {
  return compareChronologyKeys(left, right);
}

export function sortOutcomeTrackingsByChronology<T extends OutcomeTrackingChronologySortable>(
  items: T[],
): T[] {
  return [...items].sort(compareOutcomeTrackingChronology);
}

export function isStrictlyBeforeOutcomeChronology(
  candidate: OutcomeTrackingChronologySortable,
  current: Pick<OutcomeTrackingChronologySortable, 'getEvaluatedAt'>,
): boolean {
  const candidateEvaluated = candidate.getEvaluatedAt()?.getTime() ?? 0;
  const currentEvaluated = current.getEvaluatedAt()?.getTime() ?? 0;

  return candidateEvaluated < currentEvaluated;
}

export function findPreviousRecordedBeforeChronology(
  trackings: OutcomeTracking[],
  currentEvaluatedAt: Date,
  excludeOutcomeTrackingId?: string,
): OutcomeTracking | null {
  const currentAnchor = {
    getEvaluatedAt: () => currentEvaluatedAt,
  };

  const candidates = trackings.filter((tracking) => {
    if (
      excludeOutcomeTrackingId
      && tracking.getId().toString() === excludeOutcomeTrackingId
    ) {
      return false;
    }

    return isStrictlyBeforeOutcomeChronology(tracking, currentAnchor);
  });

  const sorted = sortOutcomeTrackingsByChronology(candidates);
  return sorted[0] ?? null;
}

export function findPreviousRecordedByChronology(
  trackings: OutcomeTracking[],
  current: OutcomeTracking,
): OutcomeTracking | null {
  const evaluatedAt = current.getEvaluatedAt();

  if (!evaluatedAt) {
    return null;
  }

  return findPreviousRecordedBeforeChronology(
    trackings,
    evaluatedAt,
    current.getId().toString(),
  );
}

export function findLatestRecordedByChronology(
  trackings: OutcomeTracking[],
): OutcomeTracking | null {
  const sorted = sortOutcomeTrackingsByChronology(trackings);
  return sorted[0] ?? null;
}
