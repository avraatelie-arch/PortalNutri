import { DomainError } from '../domain/errors/domain-error.js';
import { executeClinicalModuleUseCase } from './execute-clinical-module-use-case.js';
import { NutritionDiagnosisValidationError } from './errors/nutrition-diagnosis-validation.error.js';

export async function executeNutritionDiagnosisUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  return executeClinicalModuleUseCase(
    operation,
    (error: DomainError) => new NutritionDiagnosisValidationError(error.message),
  );
}
