import { DomainError } from '../domain/errors/domain-error.js';
import { MealPlanValidationError } from './errors/meal-plan-validation.error.js';

export async function executeMealPlanUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof DomainError) {
      throw new MealPlanValidationError(error.message);
    }

    throw error;
  }
}
