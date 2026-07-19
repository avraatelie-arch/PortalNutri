import { DomainError as AppointmentDomainError } from '../domain/errors/domain-error.js';
import { AppointmentValidationError } from './errors/appointment-validation.error.js';

export async function executeAppointmentUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof AppointmentDomainError) {
      throw new AppointmentValidationError(error.message);
    }

    throw error;
  }
}
