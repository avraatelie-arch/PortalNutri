import { DomainError } from '../domain/errors/domain-error.js';
import { executeClinicalModuleUseCase } from './execute-clinical-module-use-case.js';
import { AnthropometricAssessmentValidationError } from './errors/anthropometric-assessment-validation.error.js';

export async function executeAnthropometryUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  return executeClinicalModuleUseCase(
    operation,
    (error: DomainError) => new AnthropometricAssessmentValidationError(error.message),
  );
}
