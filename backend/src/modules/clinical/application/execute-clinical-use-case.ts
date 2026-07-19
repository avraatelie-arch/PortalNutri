import { DomainError as ClinicalDomainError } from '../domain/errors/domain-error.js';
import { ClinicalEncounterValidationError } from './errors/clinical-encounter-validation.error.js';

export async function executeClinicalUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof ClinicalDomainError) {
      throw new ClinicalEncounterValidationError(error.message);
    }

    throw error;
  }
}
