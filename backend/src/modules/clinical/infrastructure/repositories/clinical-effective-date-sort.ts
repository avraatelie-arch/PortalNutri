export interface ClinicalEffectiveDateSortable {
  getEffectiveAt(): Date;
  getCreatedAt(): Date;
  getId(): { toString(): string };
}

export function compareByEffectiveDate(
  left: ClinicalEffectiveDateSortable,
  right: ClinicalEffectiveDateSortable,
): number {
  const effectiveDiff =
    right.getEffectiveAt().getTime() - left.getEffectiveAt().getTime();

  if (effectiveDiff !== 0) {
    return effectiveDiff;
  }

  const createdAtDiff =
    right.getCreatedAt().getTime() - left.getCreatedAt().getTime();

  if (createdAtDiff !== 0) {
    return createdAtDiff;
  }

  return left.getId().toString().localeCompare(right.getId().toString());
}

export function sortByEffectiveDate<T extends ClinicalEffectiveDateSortable>(
  items: T[],
): T[] {
  return [...items].sort(compareByEffectiveDate);
}

export function getLatestByEffectiveDate<T extends ClinicalEffectiveDateSortable>(
  items: T[],
): T | null {
  const sorted = sortByEffectiveDate(items);
  return sorted[0] ?? null;
}
