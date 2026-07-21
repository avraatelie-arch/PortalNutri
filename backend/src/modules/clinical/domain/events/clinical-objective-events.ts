import type { DomainEvent } from './domain-event.js';
import type { ClinicalObjectivePriority } from '../value-objects/clinical-objective-priority.js';
import type { ClinicalObjectiveStatus } from '../value-objects/clinical-objective-status.js';
import type { ClinicalObjectiveTypeValue } from '../value-objects/clinical-objective-type.js';

export class ClinicalObjectiveCreated implements DomainEvent {
  readonly eventName = 'ClinicalObjectiveCreated';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly createdByNutritionistId: string,
    readonly responsibleNutritionistId: string,
    readonly originClinicalEncounterId: string | null,
    readonly originAnamnesisId: string | null,
    readonly type: ClinicalObjectiveTypeValue,
    readonly status: ClinicalObjectiveStatus,
    readonly priority: ClinicalObjectivePriority,
    readonly version: number,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class ClinicalObjectiveActivated implements DomainEvent {
  readonly eventName = 'ClinicalObjectiveActivated';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly responsibleNutritionistId: string,
    readonly type: ClinicalObjectiveTypeValue,
    readonly priority: ClinicalObjectivePriority,
    readonly status: ClinicalObjectiveStatus,
    readonly version: number,
    readonly activatedAt: Date,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class ClinicalObjectivePaused implements DomainEvent {
  readonly eventName = 'ClinicalObjectivePaused';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly responsibleNutritionistId: string,
    readonly status: ClinicalObjectiveStatus,
    readonly version: number,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class ClinicalObjectiveResumed implements DomainEvent {
  readonly eventName = 'ClinicalObjectiveResumed';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly responsibleNutritionistId: string,
    readonly status: ClinicalObjectiveStatus,
    readonly version: number,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class ClinicalObjectiveCompleted implements DomainEvent {
  readonly eventName = 'ClinicalObjectiveCompleted';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly responsibleNutritionistId: string,
    readonly status: ClinicalObjectiveStatus,
    readonly version: number,
    readonly completedAt: Date,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class ClinicalObjectiveCancelled implements DomainEvent {
  readonly eventName = 'ClinicalObjectiveCancelled';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly responsibleNutritionistId: string,
    readonly status: ClinicalObjectiveStatus,
    readonly version: number,
    readonly cancelledAt: Date,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class ClinicalObjectiveUpdated implements DomainEvent {
  readonly eventName = 'ClinicalObjectiveUpdated';
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

export class ClinicalObjectiveResponsibleNutritionistChanged implements DomainEvent {
  readonly eventName = 'ClinicalObjectiveResponsibleNutritionistChanged';
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
