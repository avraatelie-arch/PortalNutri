import { randomUUID } from 'node:crypto';
import { DomainError } from '../errors/domain-error.js';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class MealPlanMealId {
  private constructor(private readonly value: string) {}

  static create(value: string): MealPlanMealId {
    const normalized = value?.trim();

    if (!normalized) {
      throw new DomainError('Meal plan meal id is required.');
    }

    if (!UUID_PATTERN.test(normalized)) {
      throw new DomainError('Meal plan meal id must be a valid UUID.');
    }

    return new MealPlanMealId(normalized);
  }

  static generate(): MealPlanMealId {
    return new MealPlanMealId(randomUUID());
  }

  toString(): string {
    return this.value;
  }
}
