import { DomainError } from '../domain/errors/domain-error.js';
import { RoleAssignmentValidationError } from './errors/role-assignment-validation.error.js';

export async function executeRoleAssignmentUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof DomainError) {
      throw new RoleAssignmentValidationError(error.message);
    }

    throw error;
  }
}
