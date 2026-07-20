import type { AnthropometricAssessment } from '../aggregates/anthropometric-assessment.aggregate.js';
import type { AnthropometricAssessmentId } from '../value-objects/anthropometric-assessment-id.js';

export interface AnthropometricAssessmentDateRange {
  from?: Date;
  to?: Date;
}

export interface AnthropometricAssessmentRepository {
  save(assessment: AnthropometricAssessment): Promise<void>;

  findByTenantAndId(
    tenantId: string,
    assessmentId: AnthropometricAssessmentId,
  ): Promise<AnthropometricAssessment | null>;

  findByAnamnesis(
    tenantId: string,
    anamnesisId: string,
  ): Promise<AnthropometricAssessment[]>;

  findByPatient(
    tenantId: string,
    patientId: string,
    dateRange?: AnthropometricAssessmentDateRange,
  ): Promise<AnthropometricAssessment[]>;

  existsBySourceRequestId(
    tenantId: string,
    sourceRequestId: string,
  ): Promise<boolean>;
}
