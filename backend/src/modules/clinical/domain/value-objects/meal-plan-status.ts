import { DomainError } from '../errors/domain-error.js';

export const MealPlanStatusValue = {
  Draft: 'DRAFT',
  Active: 'ACTIVE',
  Cancelled: 'CANCELLED',
} as const;

export type MealPlanStatus =
  (typeof MealPlanStatusValue)[keyof typeof MealPlanStatusValue];

export function parseMealPlanStatus(value: string): MealPlanStatus {
  const normalized = value?.trim().toUpperCase();

  if (
    !Object.values(MealPlanStatusValue).includes(normalized as MealPlanStatus)
  ) {
    throw new DomainError(`Invalid meal plan status: ${value}.`);
  }

  return normalized as MealPlanStatus;
}

export function isTerminalMealPlanStatus(status: MealPlanStatus): boolean {
  return status === MealPlanStatusValue.Cancelled;
}

export function isMutableMealPlanStatus(status: MealPlanStatus): boolean {
  return !isTerminalMealPlanStatus(status);
}
