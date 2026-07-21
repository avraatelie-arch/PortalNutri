import type { NutritionDiagnosis } from '../../domain/aggregates/nutrition-diagnosis.aggregate.js';

export function compareNutritionDiagnosesByEffectiveDate(
  left: NutritionDiagnosis,
  right: NutritionDiagnosis,
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

export function sortNutritionDiagnosesByEffectiveDate(
  diagnoses: NutritionDiagnosis[],
): NutritionDiagnosis[] {
  return [...diagnoses].sort(compareNutritionDiagnosesByEffectiveDate);
}

export function getLatestNutritionDiagnosisByEffectiveDate(
  diagnoses: NutritionDiagnosis[],
): NutritionDiagnosis | null {
  const sorted = sortNutritionDiagnosesByEffectiveDate(diagnoses);
  return sorted[0] ?? null;
}
