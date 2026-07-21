import type { Anamnesis } from '../domain/aggregates/anamnesis.aggregate.js';
import type { AnamnesisRepository } from '../domain/repositories/anamnesis-repository.js';
import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import { persistAndDispatchClinicalModuleEvents } from './persist-and-dispatch-clinical-module-events.js';

export async function persistAndDispatchAnamnesisEvents(
  repository: AnamnesisRepository,
  eventDispatcher: EventDispatcher,
  anamnesis: Anamnesis,
): Promise<void> {
  return persistAndDispatchClinicalModuleEvents(
    repository,
    eventDispatcher,
    anamnesis,
  );
}
