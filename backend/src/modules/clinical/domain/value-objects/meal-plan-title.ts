import { DomainError } from '../errors/domain-error.js';
import { MealPlanTitleRequiredDomainError } from '../errors/meal-plan-title-required.domain-error.js';

export const MEAL_PLAN_TITLE_MAX_LENGTH = 200;

export class MealPlanTitle {
  private constructor(private readonly value: string) {}

  static create(value: string | null | undefined): MealPlanTitle {
    if (value === null || value === undefined) {
      return new MealPlanTitle('');
    }

    const normalized = normalizeTitle(value);

    if (normalized.length > MEAL_PLAN_TITLE_MAX_LENGTH) {
      throw new DomainError(
        `Meal plan title must not exceed ${MEAL_PLAN_TITLE_MAX_LENGTH} characters.`,
      );
    }

    return new MealPlanTitle(normalized);
  }

  static createForActivation(value: string): MealPlanTitle {
    const title = MealPlanTitle.create(value);

    if (title.isEmpty()) {
      throw new MealPlanTitleRequiredDomainError();
    }

    return title;
  }

  static fromPersistence(value: string): MealPlanTitle {
    return new MealPlanTitle(value ?? '');
  }

  equals(other: MealPlanTitle): boolean {
    return this.value === other.value;
  }

  isEmpty(): boolean {
    return this.value.length === 0;
  }

  toPersistence(): string {
    return this.value;
  }
}

function normalizeTitle(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}
