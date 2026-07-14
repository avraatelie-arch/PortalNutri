import { DomainError } from '../domain/errors/domain-error.js';
import { MembershipValidationError } from './errors/membership-validation.error.js';

export async function executeMembershipUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof DomainError) {
      throw new MembershipValidationError(error.message);
    }

    throw error;
  }
}
