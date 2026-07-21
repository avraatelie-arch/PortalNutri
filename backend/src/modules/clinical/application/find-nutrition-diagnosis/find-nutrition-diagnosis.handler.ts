import type { NutritionDiagnosisRepository } from '../../domain/repositories/nutrition-diagnosis-repository.js';
import { toNutritionDiagnosisResult } from '../nutrition-diagnosis-result.js';
import { executeNutritionDiagnosisUseCase } from '../execute-nutrition-diagnosis-use-case.js';
import { loadTenantScopedNutritionDiagnosis } from '../load-tenant-scoped-nutrition-diagnosis.js';
import { FindNutritionDiagnosisQuery } from './find-nutrition-diagnosis.query.js';

export class FindNutritionDiagnosisHandler {
  constructor(
    private readonly nutritionDiagnosisRepository: NutritionDiagnosisRepository,
  ) {}

  async execute(query: FindNutritionDiagnosisQuery) {
    return executeNutritionDiagnosisUseCase(async () => {
      const { tenantId, nutritionDiagnosisId } = query.request;

      const diagnosis = await loadTenantScopedNutritionDiagnosis(
        this.nutritionDiagnosisRepository,
        tenantId,
        nutritionDiagnosisId,
      );

      return toNutritionDiagnosisResult(diagnosis);
    });
  }
}
