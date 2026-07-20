import type { AnthropometricAssessmentRepository } from '../../domain/repositories/anthropometric-assessment-repository.js';
import {
  toAnthropometricAssessmentResult,
  type AnthropometricAssessmentResult,
} from '../anthropometric-assessment-result.js';
import { executeAnthropometryUseCase } from '../execute-anthropometry-use-case.js';
import { FindAnthropometricAssessmentsByAnamnesisQuery } from './find-anthropometric-assessments-by-anamnesis.query.js';

export class FindAnthropometricAssessmentsByAnamnesisHandler {
  constructor(
    private readonly anthropometricAssessmentRepository: AnthropometricAssessmentRepository,
  ) {}

  async execute(
    query: FindAnthropometricAssessmentsByAnamnesisQuery,
  ): Promise<AnthropometricAssessmentResult[]> {
    return executeAnthropometryUseCase(async () => {
      const assessments =
        await this.anthropometricAssessmentRepository.findByAnamnesis(
          query.request.tenantId,
          query.request.anamnesisId,
        );

      return assessments.map(toAnthropometricAssessmentResult);
    });
  }
}
