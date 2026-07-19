import type { ClinicalEncounter } from '../domain/aggregates/clinical-encounter.aggregate.js';
import type { ClinicalEncounterRepository } from '../domain/repositories/clinical-encounter-repository.js';
import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';

export async function persistAndDispatchClinicalEvents(
  repository: ClinicalEncounterRepository,
  eventDispatcher: EventDispatcher,
  encounter: ClinicalEncounter,
): Promise<void> {
  const events = encounter.pullDomainEvents();

  if (events.length === 0) {
    return;
  }

  await repository.save(encounter);
  await eventDispatcher.dispatch(events);
}
