import type { DomainEvent } from './domain-event.js';
import type { AppointmentModeValue } from '../value-objects/appointment-mode.js';

export class AppointmentScheduled implements DomainEvent {
  readonly eventName = 'AppointmentScheduled';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    readonly startsAt: Date,
    readonly endsAt: Date,
    readonly mode: AppointmentModeValue,
    occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class AppointmentConfirmed implements DomainEvent {
  readonly eventName = 'AppointmentConfirmed';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class AppointmentRescheduled implements DomainEvent {
  readonly eventName = 'AppointmentRescheduled';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    readonly startsAt: Date,
    readonly endsAt: Date,
    readonly mode: AppointmentModeValue,
    occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class AppointmentCancelled implements DomainEvent {
  readonly eventName = 'AppointmentCancelled';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    readonly cancellationReason: string,
    occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class AppointmentCompleted implements DomainEvent {
  readonly eventName = 'AppointmentCompleted';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class AppointmentMarkedNoShow implements DomainEvent {
  readonly eventName = 'AppointmentMarkedNoShow';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class AppointmentNotesUpdated implements DomainEvent {
  readonly eventName = 'AppointmentNotesUpdated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}
