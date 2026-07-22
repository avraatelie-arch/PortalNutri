import type { NutritionistDirectoryPort } from './ports/nutritionist-directory.port.js';
import type { ClinicalEvolutionNutritionistValidationErrors } from './clinical-evolution-creation-context.errors.js';

export async function validateActiveNutritionistForClinicalEvolution(params: {
  nutritionistDirectory: NutritionistDirectoryPort;
  tenantId: string;
  nutritionistId: string;
  errors: ClinicalEvolutionNutritionistValidationErrors;
}): Promise<void> {
  const nutritionist = await params.nutritionistDirectory.findById(
    params.nutritionistId,
  );

  if (!nutritionist || nutritionist.tenantId !== params.tenantId) {
    throw params.errors.nutritionistNotFound(params.tenantId, params.nutritionistId);
  }

  if (nutritionist.status !== 'ACTIVE') {
    throw params.errors.nutritionistInactive(params.tenantId, params.nutritionistId);
  }
}
