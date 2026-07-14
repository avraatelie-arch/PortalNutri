import type { DomainEvent } from './domain-event.js';

export class MembershipCreated implements DomainEvent {
  readonly eventName = 'MembershipCreated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly personId: string,
    readonly tenantId: string,
    occurredAt: Date = new Date(),
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class MembershipReactivated implements DomainEvent {
  readonly eventName = 'MembershipReactivated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly personId: string,
    readonly tenantId: string,
    occurredAt: Date = new Date(),
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class MembershipRemoved implements DomainEvent {
  readonly eventName = 'MembershipRemoved';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly personId: string,
    readonly tenantId: string,
    occurredAt: Date = new Date(),
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}
