import { DomainError as IamDomainError } from '../../iam/domain/errors/domain-error.js';
import { DomainError as PatientDomainError } from '../domain/errors/domain-error.js';

export class PatientNutritionistAssignmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PatientNutritionistAssignmentValidationError';
  }
}

export async function executePatientNutritionistAssignmentUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof PatientDomainError || error instanceof IamDomainError) {
      throw new PatientNutritionistAssignmentValidationError(error.message);
    }

    throw error;
  }
}
