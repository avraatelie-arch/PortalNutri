import { DomainError as ClinicalDomainError } from '../domain/errors/domain-error.js';
import { executeClinicalModuleUseCase } from './execute-clinical-module-use-case.js';
import { ClinicalEncounterValidationError } from './errors/clinical-encounter-validation.error.js';

export async function executeClinicalUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  return executeClinicalModuleUseCase(
    operation,
    (error: ClinicalDomainError) => new ClinicalEncounterValidationError(error.message),
  );
}
