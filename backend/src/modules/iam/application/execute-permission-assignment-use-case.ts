import { DomainError } from '../domain/errors/domain-error.js';
import { PermissionAssignmentValidationError } from './errors/permission-assignment-validation.error.js';

export async function executePermissionAssignmentUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof DomainError) {
      throw new PermissionAssignmentValidationError(error.message);
    }

    throw error;
  }
}
