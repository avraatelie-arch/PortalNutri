import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import type { MealPlanRepository } from '../../domain/repositories/meal-plan-repository.js';
import { executeMealPlanUseCase } from '../execute-meal-plan-use-case.js';
import { loadTenantScopedMealPlan } from '../load-tenant-scoped-meal-plan.js';
import { mapMealPlanDomainError } from '../map-meal-plan-domain-error.js';
import { toMealPlanResult } from '../meal-plan-result.js';
import { persistAndDispatchMealPlanEvents } from '../persist-and-dispatch-meal-plan-events.js';
import type { Clock } from '../ports/clock.port.js';
import { ActivateMealPlanCommand } from './activate-meal-plan.command.js';

export class ActivateMealPlanHandler {
  constructor(
    private readonly mealPlanRepository: MealPlanRepository,
    private readonly clock: Clock,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: ActivateMealPlanCommand) {
    return executeMealPlanUseCase(async () => {
      const { tenantId, mealPlanId } = command.request;

      const mealPlan = await loadTenantScopedMealPlan(
        this.mealPlanRepository,
        tenantId,
        mealPlanId,
      );

      try {
        mealPlan.activate(this.clock.now());
      }
      catch (error) {
        mapMealPlanDomainError(tenantId, mealPlanId, 'activate', error);
      }

      await persistAndDispatchMealPlanEvents(
        this.mealPlanRepository,
        this.eventDispatcher,
        mealPlan,
      );

      return toMealPlanResult(mealPlan);
    });
  }
}
