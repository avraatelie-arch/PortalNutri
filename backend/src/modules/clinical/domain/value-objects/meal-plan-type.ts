import { DomainError } from '../errors/domain-error.js';

export const MealPlanTypeValue = {
  Initial: 'INITIAL',
  Maintenance: 'MAINTENANCE',
  Weekday: 'WEEKDAY',
  Weekend: 'WEEKEND',
  Travel: 'TRAVEL',
  Phase: 'PHASE',
  Other: 'OTHER',
} as const;

export type MealPlanTypeValueType =
  (typeof MealPlanTypeValue)[keyof typeof MealPlanTypeValue];

export class MealPlanType {
  private constructor(private readonly value: MealPlanTypeValueType) {}

  static parse(value: string): MealPlanType {
    const normalized = value?.trim().toUpperCase();

    if (
      !Object.values(MealPlanTypeValue).includes(
        normalized as MealPlanTypeValueType,
      )
    ) {
      throw new DomainError(`Invalid meal plan type: ${value}.`);
    }

    return new MealPlanType(normalized as MealPlanTypeValueType);
  }

  static fromPersistence(value: string | null | undefined): MealPlanType | null {
    if (value === null || value === undefined) {
      return null;
    }

    return MealPlanType.parse(value);
  }

  equals(other: MealPlanType): boolean {
    return this.value === other.value;
  }

  toString(): MealPlanTypeValueType {
    return this.value;
  }

  toPersistence(): MealPlanTypeValueType {
    return this.value;
  }
}
