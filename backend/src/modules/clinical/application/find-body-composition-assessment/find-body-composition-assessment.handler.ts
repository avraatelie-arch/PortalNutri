import type { BodyCompositionAssessmentRepository } from '../../domain/repositories/body-composition-assessment-repository.js';
import { toBodyCompositionAssessmentResult } from '../body-composition-assessment-result.js';
import { executeBodyCompositionUseCase } from '../execute-body-composition-use-case.js';
import { loadTenantScopedBodyCompositionAssessment } from '../load-tenant-scoped-body-composition-assessment.js';
import { FindBodyCompositionAssessmentQuery } from './find-body-composition-assessment.query.js';

export class FindBodyCompositionAssessmentHandler {
  constructor(
    private readonly bodyCompositionAssessmentRepository: BodyCompositionAssessmentRepository,
  ) {}

  async execute(query: FindBodyCompositionAssessmentQuery) {
    return executeBodyCompositionUseCase(async () => {
      const assessment = await loadTenantScopedBodyCompositionAssessment(
        this.bodyCompositionAssessmentRepository,
        query.request.tenantId,
        query.request.assessmentId,
      );

      return toBodyCompositionAssessmentResult(assessment);
    });
  }
}
