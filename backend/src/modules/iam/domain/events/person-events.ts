import type { DocumentType } from '../value-objects/document.js';
import type { DomainEvent } from './domain-event.js';

export class PersonCreated implements DomainEvent {
  readonly eventName = 'PersonCreated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly fullName: string,
    readonly email: string,
    readonly documentType: DocumentType,
    readonly documentValue: string,
    occurredAt: Date = new Date(),
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class PersonUpdated implements DomainEvent {
  readonly eventName = 'PersonUpdated';
  readonly occurredAt: Date;
  readonly aggregateId: string;
  readonly changedFields: readonly string[];

  constructor(
    aggregateId: string,
    changedFields: readonly string[],
    occurredAt: Date = new Date(),
  ) {
    this.aggregateId = aggregateId;
    this.changedFields = [...changedFields];
    this.occurredAt = occurredAt;
  }
}

export class PersonActivated implements DomainEvent {
  readonly eventName = 'PersonActivated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string, occurredAt: Date = new Date()) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class PersonDeactivated implements DomainEvent {
  readonly eventName = 'PersonDeactivated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string, occurredAt: Date = new Date()) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}
