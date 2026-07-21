import type { MealPlan } from '../../domain/aggregates/meal-plan.aggregate.js';

export function compareMealPlansByEffectiveDate(
  left: MealPlan,
  right: MealPlan,
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

export function sortMealPlansByEffectiveDate(
  mealPlans: MealPlan[],
): MealPlan[] {
  return [...mealPlans].sort(compareMealPlansByEffectiveDate);
}

export function getLatestMealPlanByEffectiveDate(
  mealPlans: MealPlan[],
): MealPlan | null {
  const sorted = sortMealPlansByEffectiveDate(mealPlans);
  return sorted[0] ?? null;
}
