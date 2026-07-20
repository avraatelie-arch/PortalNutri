import type { AnthropometricAssessmentRepository } from '../../domain/repositories/anthropometric-assessment-repository.js';
import { toAnthropometricAssessmentResult } from '../anthropometric-assessment-result.js';
import { executeAnthropometryUseCase } from '../execute-anthropometry-use-case.js';
import { loadTenantScopedAnthropometricAssessment } from '../load-tenant-scoped-anthropometric-assessment.js';
import { FindAnthropometricAssessmentQuery } from './find-anthropometric-assessment.query.js';

export class FindAnthropometricAssessmentHandler {
  constructor(
    private readonly anthropometricAssessmentRepository: AnthropometricAssessmentRepository,
  ) {}

  async execute(query: FindAnthropometricAssessmentQuery) {
    return executeAnthropometryUseCase(async () => {
      const assessment = await loadTenantScopedAnthropometricAssessment(
        this.anthropometricAssessmentRepository,
        query.request.tenantId,
        query.request.assessmentId,
      );

      return toAnthropometricAssessmentResult(assessment);
    });
  }
}
