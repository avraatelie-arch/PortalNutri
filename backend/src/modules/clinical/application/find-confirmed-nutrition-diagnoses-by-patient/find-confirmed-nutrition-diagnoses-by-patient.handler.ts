import type { NutritionDiagnosisRepository } from '../../domain/repositories/nutrition-diagnosis-repository.js';
import {
  toNutritionDiagnosisResult,
  type NutritionDiagnosisResult,
} from '../nutrition-diagnosis-result.js';
import { executeNutritionDiagnosisUseCase } from '../execute-nutrition-diagnosis-use-case.js';
import { FindConfirmedNutritionDiagnosesByPatientQuery } from './find-confirmed-nutrition-diagnoses-by-patient.query.js';

export class FindConfirmedNutritionDiagnosesByPatientHandler {
  constructor(
    private readonly nutritionDiagnosisRepository: NutritionDiagnosisRepository,
  ) {}

  async execute(
    query: FindConfirmedNutritionDiagnosesByPatientQuery,
  ): Promise<NutritionDiagnosisResult[]> {
    return executeNutritionDiagnosisUseCase(async () => {
      const { tenantId, patientId } = query.request;

      const diagnoses = await this.nutritionDiagnosisRepository.findConfirmedByPatient(
        tenantId,
        patientId,
      );

      return diagnoses.map(toNutritionDiagnosisResult);
    });
  }
}
