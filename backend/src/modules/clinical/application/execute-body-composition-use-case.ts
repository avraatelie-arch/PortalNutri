import { DomainError } from '../domain/errors/domain-error.js';
import { BodyCompositionAssessmentValidationError } from './errors/body-composition-assessment-validation.error.js';

export async function executeBodyCompositionUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof DomainError) {
      throw new BodyCompositionAssessmentValidationError(error.message);
    }

    throw error;
  }
}
