import { DomainError } from './domain-error.js';

export const MEAL_PLAN_MAX_MEALS = 12;

export class MealPlanMaxMealsExceededDomainError extends DomainError {
  constructor() {
    super(`Meal plan cannot contain more than ${MEAL_PLAN_MAX_MEALS} meals.`);
    this.name = 'MealPlanMaxMealsExceededDomainError';
  }
}
