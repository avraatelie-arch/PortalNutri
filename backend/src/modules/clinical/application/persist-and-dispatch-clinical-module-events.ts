import type { DomainEvent } from '../domain/events/domain-event.js';
import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';

interface ClinicalModuleEventAggregate {
  pullDomainEvents(): DomainEvent[];
}

interface ClinicalModuleEventRepository<TAggregate> {
  save(aggregate: TAggregate): Promise<void>;
}

export async function persistAndDispatchClinicalModuleEvents<
  TAggregate extends ClinicalModuleEventAggregate,
>(
  repository: ClinicalModuleEventRepository<TAggregate>,
  eventDispatcher: EventDispatcher,
  aggregate: TAggregate,
): Promise<void> {
  const events = aggregate.pullDomainEvents();

  if (events.length === 0) {
    return;
  }

  await repository.save(aggregate);
  await eventDispatcher.dispatch(events);
}
