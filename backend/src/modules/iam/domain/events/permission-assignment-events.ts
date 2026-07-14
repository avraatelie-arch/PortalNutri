import type { DomainEvent } from './domain-event.js';

export class PermissionGranted implements DomainEvent {
  readonly eventName = 'PermissionGranted';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly roleId: string,
    readonly permissionId: string,
    readonly tenantId: string,
    occurredAt: Date = new Date(),
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class PermissionRevoked implements DomainEvent {
  readonly eventName = 'PermissionRevoked';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly roleId: string,
    readonly permissionId: string,
    readonly tenantId: string,
    occurredAt: Date = new Date(),
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}
