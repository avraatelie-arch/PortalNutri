import type { DomainEvent } from './domain-event.js';
import type { PatientNutritionistAssignmentRoleValue } from '../value-objects/patient-nutritionist-assignment-role.js';

export class PatientNutritionistAssigned implements DomainEvent {
  readonly eventName = 'PatientNutritionistAssigned';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    readonly role: PatientNutritionistAssignmentRoleValue,
    occurredAt: Date = new Date(),
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class PatientNutritionistReactivated implements DomainEvent {
  readonly eventName = 'PatientNutritionistReactivated';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    readonly role: PatientNutritionistAssignmentRoleValue,
    occurredAt: Date = new Date(),
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}

export class PatientNutritionistRemoved implements DomainEvent {
  readonly eventName = 'PatientNutritionistRemoved';
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(
    aggregateId: string,
    readonly tenantId: string,
    readonly patientId: string,
    readonly nutritionistId: string,
    readonly role: PatientNutritionistAssignmentRoleValue,
    occurredAt: Date = new Date(),
  ) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }
}
