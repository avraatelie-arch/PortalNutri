import { DomainError } from '../domain/errors/domain-error.js';
import { RoleValidationError } from './errors/role-validation.error.js';

export async function executeRoleUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof DomainError) {
      throw new RoleValidationError(error.message);
    }

    throw error;
  }
}
