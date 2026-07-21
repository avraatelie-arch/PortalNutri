import type { NutritionDiagnosisRepository } from '../../domain/repositories/nutrition-diagnosis-repository.js';
import { parseNutritionDiagnosisStatus } from '../../domain/value-objects/nutrition-diagnosis-status.js';
import {
  toNutritionDiagnosisResult,
  type NutritionDiagnosisResult,
} from '../nutrition-diagnosis-result.js';
import { executeNutritionDiagnosisUseCase } from '../execute-nutrition-diagnosis-use-case.js';
import { FindNutritionDiagnosesByPatientQuery } from './find-nutrition-diagnoses-by-patient.query.js';

export class FindNutritionDiagnosesByPatientHandler {
  constructor(
    private readonly nutritionDiagnosisRepository: NutritionDiagnosisRepository,
  ) {}

  async execute(
    query: FindNutritionDiagnosesByPatientQuery,
  ): Promise<NutritionDiagnosisResult[]> {
    return executeNutritionDiagnosisUseCase(async () => {
      const { tenantId, patientId, status } = query.request;

      const diagnoses = await this.nutritionDiagnosisRepository.findByPatient(
        tenantId,
        patientId,
        status ? [parseNutritionDiagnosisStatus(status)] : undefined,
      );

      return diagnoses.map(toNutritionDiagnosisResult);
    });
  }
}
