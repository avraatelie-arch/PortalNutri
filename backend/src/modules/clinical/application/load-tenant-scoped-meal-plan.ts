import type { MealPlan } from '../domain/aggregates/meal-plan.aggregate.js';
import type { MealPlanRepository } from '../domain/repositories/meal-plan-repository.js';
import { MealPlanId } from '../domain/value-objects/meal-plan-id.js';
import { MealPlanNotFoundError } from './errors/meal-plan-not-found.error.js';

export async function loadTenantScopedMealPlan(
  repository: MealPlanRepository,
  tenantId: string,
  mealPlanId: string,
): Promise<MealPlan> {
  const mealPlan = await repository.findByTenantAndId(
    tenantId,
    MealPlanId.create(mealPlanId),
  );

  if (!mealPlan) {
    throw new MealPlanNotFoundError(tenantId, mealPlanId);
  }

  return mealPlan;
}
