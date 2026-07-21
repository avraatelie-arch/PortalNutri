import type { ClinicalObjective } from '../domain/aggregates/clinical-objective.aggregate.js';
import type { ClinicalObjectiveRepository } from '../domain/repositories/clinical-objective-repository.js';
import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import { persistAndDispatchClinicalModuleEvents } from './persist-and-dispatch-clinical-module-events.js';

export async function persistAndDispatchClinicalObjectiveEvents(
  repository: ClinicalObjectiveRepository,
  eventDispatcher: EventDispatcher,
  objective: ClinicalObjective,
): Promise<void> {
  return persistAndDispatchClinicalModuleEvents(
    repository,
    eventDispatcher,
    objective,
  );
}
