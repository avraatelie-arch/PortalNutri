import type { DomainEvent } from './domain-event.js';
import type { ClinicalEncounterStatus } from '../value-objects/clinical-encounter-status.js';

export class ClinicalEncounterStarted implements DomainEvent {
  readonly eventName = 'ClinicalEncounterStarted';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    readonly appointmentId: string | null,
    readonly status: ClinicalEncounterStatus,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class ClinicalEncounterFinished implements DomainEvent {
  readonly eventName = 'ClinicalEncounterFinished';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    readonly appointmentId: string | null,
    readonly status: ClinicalEncounterStatus,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class ClinicalEncounterCancelled implements DomainEvent {
  readonly eventName = 'ClinicalEncounterCancelled';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    readonly appointmentId: string | null,
    readonly status: ClinicalEncounterStatus,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class ClinicalEncounterNotesUpdated implements DomainEvent {
  readonly eventName = 'ClinicalEncounterNotesUpdated';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    readonly appointmentId: string | null,
    readonly status: ClinicalEncounterStatus,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}
