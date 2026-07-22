import type { DomainEvent } from './domain-event.js';
import type { ClinicalEvolutionStatus } from '../value-objects/clinical-evolution-status.js';
import type { ClinicalEvolutionSectionValue } from '../value-objects/clinical-evolution-section.js';

export class ClinicalEvolutionStarted implements DomainEvent {
  readonly eventName = 'ClinicalEvolutionStarted';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
    readonly patientId: string,
    readonly createdByNutritionistId: string,
    readonly responsibleNutritionistId: string,
    readonly status: ClinicalEvolutionStatus,
    readonly clinicalMomentAt: Date,
    readonly version: number,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class ClinicalEvolutionUpdated implements DomainEvent {
  readonly eventName = 'ClinicalEvolutionUpdated';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
    readonly patientId: string,
    readonly responsibleNutritionistId: string,
    readonly status: ClinicalEvolutionStatus,
    readonly clinicalMomentAt: Date,
    readonly version: number,
    readonly section: ClinicalEvolutionSectionValue,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class ClinicalEvolutionFinalized implements DomainEvent {
  readonly eventName = 'ClinicalEvolutionFinalized';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
    readonly patientId: string,
    readonly responsibleNutritionistId: string,
    readonly status: ClinicalEvolutionStatus,
    readonly clinicalMomentAt: Date,
    readonly version: number,
    readonly finalizedAt: Date,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class ClinicalEvolutionCancelled implements DomainEvent {
  readonly eventName = 'ClinicalEvolutionCancelled';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
    readonly patientId: string,
    readonly responsibleNutritionistId: string,
    readonly status: ClinicalEvolutionStatus,
    readonly clinicalMomentAt: Date,
    readonly version: number,
    readonly cancelledAt: Date,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class ClinicalEvolutionResponsibleNutritionistChanged implements DomainEvent {
  readonly eventName = 'ClinicalEvolutionResponsibleNutritionistChanged';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly clinicalEncounterId: string,
    readonly patientId: string,
    readonly responsibleNutritionistId: string,
    readonly status: ClinicalEvolutionStatus,
    readonly clinicalMomentAt: Date,
    readonly version: number,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}
