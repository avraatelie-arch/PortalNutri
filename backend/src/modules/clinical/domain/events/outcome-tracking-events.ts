import type { DomainEvent } from './domain-event.js';
import type { OutcomeAssessmentValueType } from '../value-objects/outcome-assessment.js';
import type { AdherenceFactorValueType } from '../value-objects/adherence-factor.js';
import type { OutcomeTrackingStatus } from '../value-objects/outcome-tracking-status.js';

export class OutcomeTrackingStarted implements DomainEvent {
  readonly eventName = 'OutcomeTrackingStarted';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly clinicalObjectiveId: string,
    readonly createdByNutritionistId: string,
    readonly responsibleNutritionistId: string,
    readonly originClinicalEncounterId: string | null,
    readonly originAnamnesisId: string | null,
    readonly status: OutcomeTrackingStatus,
    readonly clinicalMomentAt: Date | null,
    readonly version: number,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class OutcomeTrackingUpdated implements DomainEvent {
  readonly eventName = 'OutcomeTrackingUpdated';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly clinicalObjectiveId: string,
    readonly responsibleNutritionistId: string,
    readonly status: OutcomeTrackingStatus,
    readonly version: number,
    readonly changedFields: string[],
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class OutcomeTrackingRecorded implements DomainEvent {
  readonly eventName = 'OutcomeTrackingRecorded';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly clinicalObjectiveId: string,
    readonly responsibleNutritionistId: string,
    readonly status: OutcomeTrackingStatus,
    readonly outcomeAssessment: OutcomeAssessmentValueType,
    readonly adherenceFactor: AdherenceFactorValueType | null,
    readonly evaluatedAt: Date,
    readonly recordedAt: Date,
    readonly version: number,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class OutcomeTrackingCancelled implements DomainEvent {
  readonly eventName = 'OutcomeTrackingCancelled';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly clinicalObjectiveId: string,
    readonly responsibleNutritionistId: string,
    readonly status: OutcomeTrackingStatus,
    readonly version: number,
    readonly cancelledAt: Date,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class OutcomeTrackingResponsibleNutritionistChanged implements DomainEvent {
  readonly eventName = 'OutcomeTrackingResponsibleNutritionistChanged';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly clinicalObjectiveId: string,
    readonly responsibleNutritionistId: string,
    readonly status: OutcomeTrackingStatus,
    readonly version: number,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}
