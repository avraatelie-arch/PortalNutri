import { DomainError } from '../domain/errors/domain-error.js';
import { executeClinicalModuleUseCase } from './execute-clinical-module-use-case.js';
import { BodyCompositionAssessmentValidationError } from './errors/body-composition-assessment-validation.error.js';

export async function executeBodyCompositionUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  return executeClinicalModuleUseCase(
    operation,
    (error: DomainError) => new BodyCompositionAssessmentValidationError(error.message),
  );
}
