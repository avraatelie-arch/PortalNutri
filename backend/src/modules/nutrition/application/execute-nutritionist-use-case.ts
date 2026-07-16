import { DomainError } from '../domain/errors/domain-error.js';
import { NutritionistValidationError } from './errors/nutritionist-validation.error.js';

export async function executeNutritionistUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof DomainError) {
      throw new NutritionistValidationError(error.message);
    }

    throw error;
  }
}
