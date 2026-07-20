import type { DomainEvent } from './domain-event.js';
import type { AnamnesisStatus } from '../value-objects/anamnesis-status.js';
import type { AnamnesisSectionValue } from '../value-objects/anamnesis-section.js';

export class AnamnesisStarted implements DomainEvent {
  readonly eventName = 'AnamnesisStarted';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    readonly status: AnamnesisStatus,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class AnamnesisSectionUpdated implements DomainEvent {
  readonly eventName = 'AnamnesisSectionUpdated';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    readonly status: AnamnesisStatus,
    readonly section: AnamnesisSectionValue,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class AnamnesisCompleted implements DomainEvent {
  readonly eventName = 'AnamnesisCompleted';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    readonly status: AnamnesisStatus,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}
