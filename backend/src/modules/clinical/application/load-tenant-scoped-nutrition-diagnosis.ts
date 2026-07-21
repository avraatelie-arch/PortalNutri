import type { NutritionDiagnosis } from '../domain/aggregates/nutrition-diagnosis.aggregate.js';
import type { NutritionDiagnosisRepository } from '../domain/repositories/nutrition-diagnosis-repository.js';
import { NutritionDiagnosisId } from '../domain/value-objects/nutrition-diagnosis-id.js';
import { NutritionDiagnosisNotFoundError } from './errors/nutrition-diagnosis-not-found.error.js';

export async function loadTenantScopedNutritionDiagnosis(
  repository: NutritionDiagnosisRepository,
  tenantId: string,
  nutritionDiagnosisId: string,
): Promise<NutritionDiagnosis> {
  const diagnosis = await repository.findByTenantAndId(
    tenantId,
    NutritionDiagnosisId.create(nutritionDiagnosisId),
  );

  if (!diagnosis) {
    throw new NutritionDiagnosisNotFoundError(tenantId, nutritionDiagnosisId);
  }

  return diagnosis;
}
