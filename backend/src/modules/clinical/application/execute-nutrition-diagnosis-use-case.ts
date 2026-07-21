import { DomainError } from '../domain/errors/domain-error.js';
import { NutritionDiagnosisValidationError } from './errors/nutrition-diagnosis-validation.error.js';

export async function executeNutritionDiagnosisUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof DomainError) {
      throw new NutritionDiagnosisValidationError(error.message);
    }

    throw error;
  }
}
