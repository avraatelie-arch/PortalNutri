import type { DomainEvent } from './domain-event.js';

export class PatientCreated implements DomainEvent {
  readonly eventName = 'PatientCreated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly fullName: string,
    readonly birthDate: string,
    readonly gender: string,
    readonly phone: string | null = null,
    readonly email: string | null = null,
    occurredAt: Date = new Date(),
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class PatientActivated implements DomainEvent {
  readonly eventName = 'PatientActivated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string, occurredAt: Date = new Date()) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class PatientDeactivated implements DomainEvent {
  readonly eventName = 'PatientDeactivated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string, occurredAt: Date = new Date()) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class PatientProfileUpdated implements DomainEvent {
  readonly eventName = 'PatientProfileUpdated';
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
