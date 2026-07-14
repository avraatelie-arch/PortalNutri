import type { DomainEvent } from './domain-event.js';

export class PermissionCreated implements DomainEvent {
  readonly eventName = 'PermissionCreated';
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
