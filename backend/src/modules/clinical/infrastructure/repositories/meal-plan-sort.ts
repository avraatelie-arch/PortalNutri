import type { MealPlan } from '../../domain/aggregates/meal-plan.aggregate.js';
import {
  compareByEffectiveDate,
  getLatestByEffectiveDate,
  sortByEffectiveDate,
} from './clinical-effective-date-sort.js';

export function compareMealPlansByEffectiveDate(
  left: MealPlan,
  right: MealPlan,
): number {
  return compareByEffectiveDate(left, right);
}

export function sortMealPlansByEffectiveDate(
  mealPlans: MealPlan[],
): MealPlan[] {
  return sortByEffectiveDate(mealPlans);
}

export function getLatestMealPlanByEffectiveDate(
  mealPlans: MealPlan[],
): MealPlan | null {
  return getLatestByEffectiveDate(mealPlans);
}
