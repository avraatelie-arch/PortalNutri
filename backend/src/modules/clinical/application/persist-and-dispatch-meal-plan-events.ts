import type { MealPlan } from '../domain/aggregates/meal-plan.aggregate.js';
import type { MealPlanRepository } from '../domain/repositories/meal-plan-repository.js';
import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';

export async function persistAndDispatchMealPlanEvents(
  repository: MealPlanRepository,
  eventDispatcher: EventDispatcher,
  mealPlan: MealPlan,
): Promise<void> {
  const events = mealPlan.pullDomainEvents();

  if (events.length === 0) {
    return;
  }

  await repository.save(mealPlan);
  await eventDispatcher.dispatch(events);
}
