import { DomainError } from '../errors/domain-error.js';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class PatientNutritionistAssignmentId {
  private constructor(private readonly value: string) {}

  static create(value: string): PatientNutritionistAssignmentId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('PatientNutritionistAssignmentId is required.');
    }

    if (!UUID_REGEX.test(normalized)) {
      throw new DomainError(
        'PatientNutritionistAssignmentId must be a valid UUID.',
      );
    }

    return new PatientNutritionistAssignmentId(normalized);
  }

  static generate(): PatientNutritionistAssignmentId {
    return new PatientNutritionistAssignmentId(crypto.randomUUID());
  }

  equals(other: PatientNutritionistAssignmentId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
