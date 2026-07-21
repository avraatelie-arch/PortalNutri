import { DomainError } from '../domain/errors/domain-error.js';
import { ClinicalObjectiveValidationError } from './errors/clinical-objective-validation.error.js';

export async function executeClinicalObjectiveUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof DomainError) {
      throw new ClinicalObjectiveValidationError(error.message);
    }

    throw error;
  }
}
