import { DomainError } from '../domain/errors/domain-error.js';
import { PersonValidationError } from './errors/person-validation.error.js';

export async function executeUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof DomainError) {
      throw new PersonValidationError(error.message);
    }

    throw error;
  }
}
