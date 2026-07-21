import { DomainError } from '../domain/errors/domain-error.js';

export async function executeClinicalModuleUseCase<T>(
  operation: () => Promise<T>,
  mapDomainError: (error: DomainError) => Error,
): Promise<T> {
  try {
    return await operation();
  }
  catch (error) {
    if (error instanceof DomainError) {
      throw mapDomainError(error);
    }

    throw error;
  }
}
