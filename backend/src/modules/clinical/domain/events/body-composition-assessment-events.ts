import type { DomainEvent } from './domain-event.js';
import type { BodyCompositionMeasurementSourceValue } from '../value-objects/body-composition-measurement-source.js';

export class BodyCompositionRecorded implements DomainEvent {
  readonly eventName = 'BodyCompositionRecorded';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly anamnesisId: string,
    readonly clinicalEncounterId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    readonly anthropometricAssessmentId: string | null,
    readonly measurementSource: BodyCompositionMeasurementSourceValue,
    readonly version: number,
    readonly measuredAt: Date,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}
