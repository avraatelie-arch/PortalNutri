import { DomainError } from '../errors/domain-error.js';

export const MEAL_NAME_MAX_LENGTH = 100;

export class MealName {
  private constructor(private readonly value: string) {}

  static create(value: string | null | undefined): MealName {
    if (value === null || value === undefined) {
      throw new DomainError('Meal name is required.');
    }

    const normalized = value.trim().replace(/\s+/g, ' ');

    if (normalized.length === 0) {
      throw new DomainError('Meal name is required.');
    }

    if (normalized.length > MEAL_NAME_MAX_LENGTH) {
      throw new DomainError(
        `Meal name must not exceed ${MEAL_NAME_MAX_LENGTH} characters.`,
      );
    }

    return new MealName(normalized);
  }

  static fromPersistence(value: string): MealName {
    return new MealName(value);
  }

  equals(other: MealName): boolean {
    return this.value === other.value;
  }

  toPersistence(): string {
    return this.value;
  }
}
