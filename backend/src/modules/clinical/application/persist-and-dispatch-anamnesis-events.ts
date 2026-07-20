import type { Anamnesis } from '../domain/aggregates/anamnesis.aggregate.js';
import type { AnamnesisRepository } from '../domain/repositories/anamnesis-repository.js';
import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';

export async function persistAndDispatchAnamnesisEvents(
  repository: AnamnesisRepository,
  eventDispatcher: EventDispatcher,
  anamnesis: Anamnesis,
): Promise<void> {
  const events = anamnesis.pullDomainEvents();

  if (events.length === 0) {
    return;
  }

  await repository.save(anamnesis);
  await eventDispatcher.dispatch(events);
}
