import { DomainError } from '../domain/errors/domain-error.js';
import { executeClinicalModuleUseCase } from './execute-clinical-module-use-case.js';
import { ClinicalObjectiveValidationError } from './errors/clinical-objective-validation.error.js';

export async function executeClinicalObjectiveUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  return executeClinicalModuleUseCase(
    operation,
    (error: DomainError) => new ClinicalObjectiveValidationError(error.message),
  );
}
