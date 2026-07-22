import type { NutritionDiagnosis } from '../../domain/aggregates/nutrition-diagnosis.aggregate.js';
import {
  compareByEffectiveDate,
  getLatestByEffectiveDate,
  sortByEffectiveDate,
} from './clinical-effective-date-sort.js';

export function compareNutritionDiagnosesByEffectiveDate(
  left: NutritionDiagnosis,
  right: NutritionDiagnosis,
): number {
  return compareByEffectiveDate(left, right);
}

export function sortNutritionDiagnosesByEffectiveDate(
  diagnoses: NutritionDiagnosis[],
): NutritionDiagnosis[] {
  return sortByEffectiveDate(diagnoses);
}

export function getLatestNutritionDiagnosisByEffectiveDate(
  diagnoses: NutritionDiagnosis[],
): NutritionDiagnosis | null {
  return getLatestByEffectiveDate(diagnoses);
}
