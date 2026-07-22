import { NutritionistInactiveForClinicalEvolutionError } from './errors/nutritionist-inactive-for-clinical-evolution.error.js';
import { NutritionistNotFoundForClinicalEvolutionError } from './errors/nutritionist-not-found-for-clinical-evolution.error.js';

export interface ClinicalEvolutionNutritionistValidationErrors {
  nutritionistNotFound: (tenantId: string, nutritionistId: string) => Error;
  nutritionistInactive: (tenantId: string, nutritionistId: string) => Error;
}

export function createClinicalEvolutionNutritionistValidationErrors(): ClinicalEvolutionNutritionistValidationErrors {
  return {
    nutritionistNotFound: (tenantId, nutritionistId) =>
      new NutritionistNotFoundForClinicalEvolutionError(tenantId, nutritionistId),
    nutritionistInactive: (tenantId, nutritionistId) =>
      new NutritionistInactiveForClinicalEvolutionError(tenantId, nutritionistId),
  };
}
