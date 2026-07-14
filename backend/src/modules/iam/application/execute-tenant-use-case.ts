import { DomainError } from '../domain/errors/domain-error.js';
import { TenantValidationError } from './errors/tenant-validation.error.js';

export async function executeTenantUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof DomainError) {
      throw new TenantValidationError(error.message);
    }

    throw error;
  }
}
