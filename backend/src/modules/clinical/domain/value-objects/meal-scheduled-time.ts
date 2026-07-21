import { DomainError } from '../errors/domain-error.js';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class MealScheduledTime {
  private constructor(private readonly value: string) {}

  static create(value: string | null | undefined): MealScheduledTime | null {
    if (value === null || value === undefined) {
      return null;
    }

    const normalized = value.trim();

    if (normalized.length === 0) {
      return null;
    }

    if (!TIME_PATTERN.test(normalized)) {
      throw new DomainError(
        'Meal scheduled time must be in HH:MM format (e.g. 07:30).',
      );
    }

    return new MealScheduledTime(normalized);
  }

  static fromPersistence(value: string | null | undefined): MealScheduledTime | null {
    if (value === null || value === undefined) {
      return null;
    }

    return new MealScheduledTime(value);
  }

  equals(other: MealScheduledTime | null): boolean {
    if (other === null) {
      return false;
    }

    return this.value === other.value;
  }

  toPersistence(): string {
    return this.value;
  }
}
