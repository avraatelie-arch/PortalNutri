import type { DomainEvent } from '../events/domain-event.js';

export abstract class AggregateRoot {
  private readonly _domainEvents: DomainEvent[] = [];

  get domainEvents(): readonly DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this.clearDomainEvents();
    return events;
  }

  clearDomainEvents(): void {
    this._domainEvents.length = 0;
  }
}
