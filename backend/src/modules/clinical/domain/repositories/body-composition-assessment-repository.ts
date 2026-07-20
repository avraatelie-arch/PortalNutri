import type { BodyCompositionAssessment } from '../aggregates/body-composition-assessment.aggregate.js';
import type { BodyCompositionAssessmentId } from '../value-objects/body-composition-assessment-id.js';

export interface BodyCompositionAssessmentDateRange {
  from?: Date;
  to?: Date;
}

export interface BodyCompositionAssessmentRepository {
  save(assessment: BodyCompositionAssessment): Promise<void>;

  findByTenantAndId(
    tenantId: string,
    assessmentId: BodyCompositionAssessmentId,
  ): Promise<BodyCompositionAssessment | null>;

  findByAnamnesis(
    tenantId: string,
    anamnesisId: string,
  ): Promise<BodyCompositionAssessment[]>;

  findByPatient(
    tenantId: string,
    patientId: string,
    dateRange?: BodyCompositionAssessmentDateRange,
  ): Promise<BodyCompositionAssessment[]>;

  existsBySourceRequestId(
    tenantId: string,
    sourceRequestId: string,
  ): Promise<boolean>;
}
