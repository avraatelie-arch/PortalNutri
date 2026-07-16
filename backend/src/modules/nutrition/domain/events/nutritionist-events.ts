import type { DomainEvent } from './domain-event.js';

export class NutritionistCreated implements DomainEvent {
  readonly eventName = 'NutritionistCreated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly personId: string,
    readonly tenantId: string,
    readonly crn: string,
    readonly stateCode: string,
    readonly specialty: string,
    readonly bio: string | null = null,
    occurredAt: Date = new Date(),
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class NutritionistActivated implements DomainEvent {
  readonly eventName = 'NutritionistActivated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string, occurredAt: Date = new Date()) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class NutritionistDeactivated implements DomainEvent {
  readonly eventName = 'NutritionistDeactivated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string, occurredAt: Date = new Date()) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class NutritionistProfileUpdated implements DomainEvent {
  readonly eventName = 'NutritionistProfileUpdated';
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
