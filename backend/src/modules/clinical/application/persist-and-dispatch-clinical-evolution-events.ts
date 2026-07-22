import type { ClinicalEvolution } from '../domain/aggregates/clinical-evolution.aggregate.js';
import type { ClinicalEvolutionRepository } from '../domain/repositories/clinical-evolution-repository.js';
import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import { persistAndDispatchClinicalModuleEvents } from './persist-and-dispatch-clinical-module-events.js';

export async function persistAndDispatchClinicalEvolutionEvents(
  repository: ClinicalEvolutionRepository,
  eventDispatcher: EventDispatcher,
  evolution: ClinicalEvolution,
): Promise<void> {
  return persistAndDispatchClinicalModuleEvents(
    repository,
    eventDispatcher,
    evolution,
  );
}
