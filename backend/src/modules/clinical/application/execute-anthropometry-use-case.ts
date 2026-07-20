import { DomainError } from '../domain/errors/domain-error.js';
import { AnthropometricAssessmentValidationError } from './errors/anthropometric-assessment-validation.error.js';

export async function executeAnthropometryUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof DomainError) {
      throw new AnthropometricAssessmentValidationError(error.message);
    }

    throw error;
  }
}
