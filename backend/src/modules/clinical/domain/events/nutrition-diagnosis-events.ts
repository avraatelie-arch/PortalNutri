import type { DomainEvent } from './domain-event.js';
import type { NutritionDiagnosisStatus } from '../value-objects/nutrition-diagnosis-status.js';
import type { NutritionProblemCategoryValue } from '../value-objects/nutrition-problem-category.js';

export class NutritionDiagnosisCreated implements DomainEvent {
  readonly eventName = 'NutritionDiagnosisCreated';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly createdByNutritionistId: string,
    readonly responsibleNutritionistId: string,
    readonly originClinicalEncounterId: string | null,
    readonly originAnamnesisId: string | null,
    readonly problemCategory: NutritionProblemCategoryValue,
    readonly status: NutritionDiagnosisStatus,
    readonly version: number,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class NutritionDiagnosisUpdated implements DomainEvent {
  readonly eventName = 'NutritionDiagnosisUpdated';
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

export class NutritionDiagnosisConfirmed implements DomainEvent {
  readonly eventName = 'NutritionDiagnosisConfirmed';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly responsibleNutritionistId: string,
    readonly problemCategory: NutritionProblemCategoryValue,
    readonly status: NutritionDiagnosisStatus,
    readonly version: number,
    readonly confirmedAt: Date,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class NutritionDiagnosisCancelled implements DomainEvent {
  readonly eventName = 'NutritionDiagnosisCancelled';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly responsibleNutritionistId: string,
    readonly status: NutritionDiagnosisStatus,
    readonly version: number,
    readonly cancelledAt: Date,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class NutritionDiagnosisResponsibleNutritionistChanged implements DomainEvent {
  readonly eventName = 'NutritionDiagnosisResponsibleNutritionistChanged';
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
