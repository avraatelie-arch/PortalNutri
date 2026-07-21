import { DomainError } from '../domain/errors/domain-error.js';
import { executeClinicalModuleUseCase } from './execute-clinical-module-use-case.js';
import { MealPlanValidationError } from './errors/meal-plan-validation.error.js';

export async function executeMealPlanUseCase<T>(
  operation: () => Promise<T>,
): Promise<T> {
  return executeClinicalModuleUseCase(
    operation,
    (error: DomainError) => new MealPlanValidationError(error.message),
  );
}
