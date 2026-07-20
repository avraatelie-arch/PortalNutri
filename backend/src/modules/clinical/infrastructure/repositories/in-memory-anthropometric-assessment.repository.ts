import type { AnthropometricAssessmentRepository } from '../../domain/repositories/anthropometric-assessment-repository.js';
import type { AnthropometricAssessment } from '../../domain/aggregates/anthropometric-assessment.aggregate.js';
import type { AnthropometricAssessmentId } from '../../domain/value-objects/anthropometric-assessment-id.js';

function compareAssessments(
  left: AnthropometricAssessment,
  right: AnthropometricAssessment,
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

export class InMemoryAnthropometricAssessmentRepository
  implements AnthropometricAssessmentRepository
{
  private readonly assessments = new Map<string, AnthropometricAssessment>();

  async save(assessment: AnthropometricAssessment): Promise<void> {
    this.assessments.set(assessment.getId().toString(), assessment);
  }

  async findByTenantAndId(
    tenantId: string,
    assessmentId: AnthropometricAssessmentId,
  ): Promise<AnthropometricAssessment | null> {
    const assessment = this.assessments.get(assessmentId.toString());

    if (!assessment || assessment.getTenantId() !== tenantId) {
      return null;
    }

    return assessment;
  }

  async findByAnamnesis(
    tenantId: string,
    anamnesisId: string,
  ): Promise<AnthropometricAssessment[]> {
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
  ): Promise<AnthropometricAssessment[]> {
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
