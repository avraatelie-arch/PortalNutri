import { DomainError } from '../errors/domain-error.js';

export enum PatientNutritionistAssignmentRoleValue {
  Primary = 'PRIMARY',
  Supporting = 'SUPPORTING',
}

export class PatientNutritionistAssignmentRole {
  private constructor(private readonly value: PatientNutritionistAssignmentRoleValue) {}

  static create(value: string): PatientNutritionistAssignmentRole {
    const normalized = value?.trim().toUpperCase();

    if (
      normalized !== PatientNutritionistAssignmentRoleValue.Primary &&
      normalized !== PatientNutritionistAssignmentRoleValue.Supporting
    ) {
      throw new DomainError(
        'PatientNutritionistAssignmentRole must be PRIMARY or SUPPORTING.',
      );
    }

    return new PatientNutritionistAssignmentRole(
      normalized as PatientNutritionistAssignmentRoleValue,
    );
  }

  static primary(): PatientNutritionistAssignmentRole {
    return new PatientNutritionistAssignmentRole(
      PatientNutritionistAssignmentRoleValue.Primary,
    );
  }

  static supporting(): PatientNutritionistAssignmentRole {
    return new PatientNutritionistAssignmentRole(
      PatientNutritionistAssignmentRoleValue.Supporting,
    );
  }

  isPrimary(): boolean {
    return this.value === PatientNutritionistAssignmentRoleValue.Primary;
  }

  equals(other: PatientNutritionistAssignmentRole): boolean {
    return this.value === other.value;
  }

  toString(): PatientNutritionistAssignmentRoleValue {
    return this.value;
  }
}
