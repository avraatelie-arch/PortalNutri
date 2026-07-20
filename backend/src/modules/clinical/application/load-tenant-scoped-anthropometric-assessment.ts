import type { AnthropometricAssessment } from '../domain/aggregates/anthropometric-assessment.aggregate.js';
import type { AnthropometricAssessmentRepository } from '../domain/repositories/anthropometric-assessment-repository.js';
import { AnthropometricAssessmentId } from '../domain/value-objects/anthropometric-assessment-id.js';
import { AnthropometricAssessmentNotFoundError } from './errors/anthropometric-assessment-not-found.error.js';

export async function loadTenantScopedAnthropometricAssessment(
  repository: AnthropometricAssessmentRepository,
  tenantId: string,
  assessmentId: string,
): Promise<AnthropometricAssessment> {
  const assessment = await repository.findByTenantAndId(
    tenantId,
    AnthropometricAssessmentId.create(assessmentId),
  );

  if (!assessment) {
    throw new AnthropometricAssessmentNotFoundError(tenantId, assessmentId);
  }

  return assessment;
}
