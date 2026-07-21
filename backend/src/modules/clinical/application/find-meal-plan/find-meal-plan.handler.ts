import type { MealPlanRepository } from '../../domain/repositories/meal-plan-repository.js';
import { executeMealPlanUseCase } from '../execute-meal-plan-use-case.js';
import { loadTenantScopedMealPlan } from '../load-tenant-scoped-meal-plan.js';
import { toMealPlanResult } from '../meal-plan-result.js';
import { FindMealPlanQuery } from './find-meal-plan.query.js';

export class FindMealPlanHandler {
  constructor(
    private readonly mealPlanRepository: MealPlanRepository,
  ) {}

  async execute(query: FindMealPlanQuery) {
    return executeMealPlanUseCase(async () => {
      const { tenantId, mealPlanId } = query.request;

      const mealPlan = await loadTenantScopedMealPlan(
        this.mealPlanRepository,
        tenantId,
        mealPlanId,
      );

      return toMealPlanResult(mealPlan);
    });
  }
}
