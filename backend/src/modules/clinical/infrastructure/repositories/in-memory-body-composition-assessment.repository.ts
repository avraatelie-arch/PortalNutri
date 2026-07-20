import type { BodyCompositionAssessmentRepository } from '../../domain/repositories/body-composition-assessment-repository.js';
import type { BodyCompositionAssessment } from '../../domain/aggregates/body-composition-assessment.aggregate.js';
import type { BodyCompositionAssessmentId } from '../../domain/value-objects/body-composition-assessment-id.js';

function compareAssessments(
  left: BodyCompositionAssessment,
  right: BodyCompositionAssessment,
): number {
  const measuredAtDiff =
    right.getMeasuredAt().getTime() - left.getMeasuredAt().getTime();

  if (measuredAtDiff !== 0) {
    return measuredAtDiff;
  }

  const createdAtDiff =
    right.getCreatedAt().getTime() - left.getCreatedAt().getTime();

  if (createdAtDiff !== 0) {
    return createdAtDiff;
  }

  return left.getId().toString().localeCompare(right.getId().toString());
}

export class InMemoryBodyCompositionAssessmentRepository
  implements BodyCompositionAssessmentRepository
{
  private readonly assessments = new Map<string, BodyCompositionAssessment>();

  async save(assessment: BodyCompositionAssessment): Promise<void> {
    this.assessments.set(assessment.getId().toString(), assessment);
  }

  async findByTenantAndId(
    tenantId: string,
    assessmentId: BodyCompositionAssessmentId,
  ): Promise<BodyCompositionAssessment | null> {
    const assessment = this.assessments.get(assessmentId.toString());

    if (!assessment || assessment.getTenantId() !== tenantId) {
      return null;
    }

    return assessment;
  }

  async findByAnamnesis(
    tenantId: string,
    anamnesisId: string,
  ): Promise<BodyCompositionAssessment[]> {
    return [...this.assessments.values()]
      .filter(
        (assessment) =>
          assessment.getTenantId() === tenantId
          && assessment.getAnamnesisId() === anamnesisId,
      )
      .sort(compareAssessments);
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
    dateRange?: { from?: Date; to?: Date },
  ): Promise<BodyCompositionAssessment[]> {
    return [...this.assessments.values()]
      .filter((assessment) => {
        if (
          assessment.getTenantId() !== tenantId
          || assessment.getPatientId() !== patientId
        ) {
          return false;
        }

        const measuredAt = assessment.getMeasuredAt();

        if (dateRange?.from && measuredAt.getTime() < dateRange.from.getTime()) {
          return false;
        }

        if (dateRange?.to && measuredAt.getTime() > dateRange.to.getTime()) {
          return false;
        }

        return true;
      })
      .sort(compareAssessments);
  }

  async existsBySourceRequestId(
    tenantId: string,
    sourceRequestId: string,
  ): Promise<boolean> {
    for (const assessment of this.assessments.values()) {
      if (
        assessment.getTenantId() === tenantId
        && assessment.getSourceRequestId()?.toString() === sourceRequestId
      ) {
        return true;
      }
    }

    return false;
  }
}
