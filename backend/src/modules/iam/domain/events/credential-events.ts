import type { DomainEvent } from './domain-event.js';

export class PasswordChanged implements DomainEvent {
  readonly eventName = 'PasswordChanged';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string, occurredAt: Date = new Date()) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}
