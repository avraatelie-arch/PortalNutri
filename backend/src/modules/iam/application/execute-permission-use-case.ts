import { DomainError } from '../domain/errors/domain-error.js';
import { PermissionValidationError } from './errors/permission-validation.error.js';

export async function executePermissionUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof DomainError) {
      throw new PermissionValidationError(error.message);
    }

    throw error;
  }
}
