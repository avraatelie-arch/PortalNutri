import { DomainError } from '../domain/errors/domain-error.js';
import { executeClinicalModuleUseCase } from './execute-clinical-module-use-case.js';
import { PrescriptionValidationError } from './errors/prescription-validation.error.js';

export async function executePrescriptionUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  return executeClinicalModuleUseCase(
    operation,
    (error: DomainError) => new PrescriptionValidationError(error.message),
  );
}
