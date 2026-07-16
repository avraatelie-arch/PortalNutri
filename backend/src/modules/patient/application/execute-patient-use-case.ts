import { DomainError as IamDomainError } from '../../iam/domain/errors/domain-error.js';
import { DomainError as PatientDomainError } from '../domain/errors/domain-error.js';
import { PatientValidationError } from './errors/patient-validation.error.js';

export async function executePatientUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof PatientDomainError || error instanceof IamDomainError) {
      throw new PatientValidationError(error.message);
    }

    throw error;
  }
}
