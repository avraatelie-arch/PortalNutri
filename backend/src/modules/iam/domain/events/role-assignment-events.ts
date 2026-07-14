import type { DomainEvent } from './domain-event.js';

export class RoleAssigned implements DomainEvent {
  readonly eventName = 'RoleAssigned';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly membershipId: string,
    readonly roleId: string,
    readonly tenantId: string,
    occurredAt: Date = new Date(),
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class RoleRemoved implements DomainEvent {
  readonly eventName = 'RoleRemoved';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly membershipId: string,
    readonly roleId: string,
    readonly tenantId: string,
    occurredAt: Date = new Date(),
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}
