import type { DomainEvent } from './domain-event.js';
import type { MealPlanStatus } from '../value-objects/meal-plan-status.js';
import type { MealPlanTypeValueType } from '../value-objects/meal-plan-type.js';

export class MealPlanCreated implements DomainEvent {
  readonly eventName = 'MealPlanCreated';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly createdByNutritionistId: string,
    readonly responsibleNutritionistId: string,
    readonly originClinicalEncounterId: string | null,
    readonly originAnamnesisId: string | null,
    readonly planType: MealPlanTypeValueType | null,
    readonly status: MealPlanStatus,
    readonly version: number,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class MealPlanUpdated implements DomainEvent {
  readonly eventName = 'MealPlanUpdated';
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

export class MealPlanActivated implements DomainEvent {
  readonly eventName = 'MealPlanActivated';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly responsibleNutritionistId: string,
    readonly planType: MealPlanTypeValueType | null,
    readonly status: MealPlanStatus,
    readonly version: number,
    readonly activatedAt: Date,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class MealPlanCancelled implements DomainEvent {
  readonly eventName = 'MealPlanCancelled';
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly responsibleNutritionistId: string,
    readonly status: MealPlanStatus,
    readonly version: number,
    readonly cancelledAt: Date,
    readonly occurredAt: Date,
  ) {
    this.aggregateId = aggregateId;
  }
}

export class MealPlanResponsibleNutritionistChanged implements DomainEvent {
  readonly eventName = 'MealPlanResponsibleNutritionistChanged';
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
