import type { MealPlan } from '../domain/aggregates/meal-plan.aggregate.js';
import type { MealPlanRepository } from '../domain/repositories/meal-plan-repository.js';
import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import { persistAndDispatchClinicalModuleEvents } from './persist-and-dispatch-clinical-module-events.js';

export async function persistAndDispatchMealPlanEvents(
  repository: MealPlanRepository,
  eventDispatcher: EventDispatcher,
  mealPlan: MealPlan,
): Promise<void> {
  return persistAndDispatchClinicalModuleEvents(
    repository,
    eventDispatcher,
    mealPlan,
  );
}
