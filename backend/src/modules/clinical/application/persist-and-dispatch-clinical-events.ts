import type { ClinicalEncounter } from '../domain/aggregates/clinical-encounter.aggregate.js';
import type { ClinicalEncounterRepository } from '../domain/repositories/clinical-encounter-repository.js';
import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import { persistAndDispatchClinicalModuleEvents } from './persist-and-dispatch-clinical-module-events.js';

export async function persistAndDispatchClinicalEvents(
  repository: ClinicalEncounterRepository,
  eventDispatcher: EventDispatcher,
  encounter: ClinicalEncounter,
): Promise<void> {
  return persistAndDispatchClinicalModuleEvents(
    repository,
    eventDispatcher,
    encounter,
  );
}
