import type { BodyCompositionAssessmentRepository } from '../../domain/repositories/body-composition-assessment-repository.js';
import {
  toBodyCompositionAssessmentResult,
  type BodyCompositionAssessmentResult,
} from '../body-composition-assessment-result.js';
import { executeBodyCompositionUseCase } from '../execute-body-composition-use-case.js';
import { FindBodyCompositionAssessmentsByAnamnesisQuery } from './find-body-composition-assessments-by-anamnesis.query.js';

export class FindBodyCompositionAssessmentsByAnamnesisHandler {
  constructor(
    private readonly bodyCompositionAssessmentRepository: BodyCompositionAssessmentRepository,
  ) {}

  async execute(
    query: FindBodyCompositionAssessmentsByAnamnesisQuery,
  ): Promise<BodyCompositionAssessmentResult[]> {
    return executeBodyCompositionUseCase(async () => {
      const assessments =
        await this.bodyCompositionAssessmentRepository.findByAnamnesis(
          query.request.tenantId,
          query.request.anamnesisId,
        );

      return assessments.map(toBodyCompositionAssessmentResult);
    });
  }
}
