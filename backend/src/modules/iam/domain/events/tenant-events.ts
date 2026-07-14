import type { DomainEvent } from './domain-event.js';

export class TenantCreated implements DomainEvent {
  readonly eventName = 'TenantCreated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly name: string,
    readonly slug: string,
    occurredAt: Date = new Date(),
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class TenantActivated implements DomainEvent {
  readonly eventName = 'TenantActivated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string, occurredAt: Date = new Date()) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class TenantDeactivated implements DomainEvent {
  readonly eventName = 'TenantDeactivated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string, occurredAt: Date = new Date()) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}
