import type { BodyCompositionAssessment } from '../domain/aggregates/body-composition-assessment.aggregate.js';
import type { BodyCompositionAssessmentRepository } from '../domain/repositories/body-composition-assessment-repository.js';
import { BodyCompositionAssessmentId } from '../domain/value-objects/body-composition-assessment-id.js';
import { BodyCompositionAssessmentNotFoundError } from './errors/body-composition-assessment-not-found.error.js';

export async function loadTenantScopedBodyCompositionAssessment(
  repository: BodyCompositionAssessmentRepository,
  tenantId: string,
  assessmentId: string,
): Promise<BodyCompositionAssessment> {
  const assessment = await repository.findByTenantAndId(
    tenantId,
    BodyCompositionAssessmentId.create(assessmentId),
  );

  if (!assessment) {
    throw new BodyCompositionAssessmentNotFoundError(tenantId, assessmentId);
  }

  return assessment;
}
