import type { DomainEvent } from './domain-event.js';
import type { PrescriptionStatus } from '../value-objects/prescription-status.js';

export class PrescriptionCreated implements DomainEvent {
  readonly eventName = 'PrescriptionCreated';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly createdByNutritionistId: string,
    readonly responsibleNutritionistId: string,
    readonly originClinicalEncounterId: string | null,
    readonly originAnamnesisId: string | null,
    readonly status: PrescriptionStatus,
    readonly version: number,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class PrescriptionUpdated implements DomainEvent {
  readonly eventName = 'PrescriptionUpdated';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly version: number,
    readonly changedFields: string[],
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class PrescriptionIssued implements DomainEvent {
  readonly eventName = 'PrescriptionIssued';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly responsibleNutritionistId: string,
    readonly status: PrescriptionStatus,
    readonly version: number,
    readonly issuedAt: Date,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class PrescriptionCancelled implements DomainEvent {
  readonly eventName = 'PrescriptionCancelled';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly responsibleNutritionistId: string,
    readonly status: PrescriptionStatus,
    readonly version: number,
    readonly cancelledAt: Date,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class PrescriptionResponsibleNutritionistChanged implements DomainEvent {
  readonly eventName = 'PrescriptionResponsibleNutritionistChanged';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly responsibleNutritionistId: string,
    readonly version: number,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}
