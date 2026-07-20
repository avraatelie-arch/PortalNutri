import type { DomainEvent } from './domain-event.js';

export class AnthropometricAssessmentRecorded implements DomainEvent {
  readonly eventName = 'AnthropometricAssessmentRecorded';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly anamnesisId: string,
    readonly clinicalEncounterId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    readonly version: number,
    readonly measuredAt: Date,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}
