import { DomainError } from '../domain/errors/domain-error.js';
import { executeClinicalModuleUseCase } from './execute-clinical-module-use-case.js';
import { OutcomeTrackingValidationError } from './errors/outcome-tracking-validation.error.js';

export async function executeOutcomeTrackingUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  return executeClinicalModuleUseCase(
    operation,
    (error: DomainError) => new OutcomeTrackingValidationError(error.message),
  );
}
