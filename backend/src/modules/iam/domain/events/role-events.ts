import type { DomainEvent } from './domain-event.js';

export class RoleCreated implements DomainEvent {
  readonly eventName = 'RoleCreated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly name: string,
    occurredAt: Date = new Date(),
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}
