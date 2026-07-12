import type { DomainEvent } from './domain-event.js';

export class SessionCreated implements DomainEvent {
  readonly eventName = 'SessionCreated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string, occurredAt: Date = new Date()) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class SessionRevoked implements DomainEvent {
  readonly eventName = 'SessionRevoked';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string, occurredAt: Date = new Date()) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}
