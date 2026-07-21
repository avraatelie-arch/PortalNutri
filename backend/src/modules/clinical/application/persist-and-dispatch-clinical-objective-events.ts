import type { ClinicalObjective } from '../domain/aggregates/clinical-objective.aggregate.js';
import type { ClinicalObjectiveRepository } from '../domain/repositories/clinical-objective-repository.js';
import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';

export async function persistAndDispatchClinicalObjectiveEvents(
  repository: ClinicalObjectiveRepository,
  eventDispatcher: EventDispatcher,
  objective: ClinicalObjective,
): Promise<void> {
  const events = objective.pullDomainEvents();

  if (events.length === 0) {
    return;
  }

  await repository.save(objective);
  await eventDispatcher.dispatch(events);
}
