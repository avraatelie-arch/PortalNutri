import type { AnthropometricAssessment } from '../domain/aggregates/anthropometric-assessment.aggregate.js';
import type { BodyMassIndexClassification } from '../domain/value-objects/body-mass-index-classification.js';

export interface AnthropometricAssessmentResult {
  id: string;
  tenantId: string;
  anamnesisId: string;
  clinicalEncounterId: string;
  patientId: string;
  nutritionistId: string;
  sourceRequestId: string | null;
  weightKg: string;
  heightCm: string;
  bodyMassIndex: string;
  bodyMassIndexClassification: BodyMassIndexClassification;
  waistCircumferenceCm: string | null;
  hipCircumferenceCm: string | null;
  abdominalCircumferenceCm: string | null;
  neckCircumferenceCm: string | null;
  armCircumferenceCm: string | null;
  calfCircumferenceCm: string | null;
  waistToHipRatio: string | null;
  notes: string | null;
  measuredAt: string;
  version: number;
  createdAt: string;
}

export function toAnthropometricAssessmentResult(
  assessment: AnthropometricAssessment,
): AnthropometricAssessmentResult {
  return {
    id: assessment.getId().toString(),
    tenantId: assessment.getTenantId(),
    anamnesisId: assessment.getAnamnesisId(),
    clinicalEncounterId: assessment.getClinicalEncounterId(),
    patientId: assessment.getPatientId(),
    nutritionistId: assessment.getNutritionistId(),
    sourceRequestId: assessment.getSourceRequestId()?.toString() ?? null,
    weightKg: assessment.getWeight().toString(),
    heightCm: assessment.getHeight().toString(),
    bodyMassIndex: assessment.getBodyMassIndex().toString(),
    bodyMassIndexClassification: assessment.getBodyMassIndexClassification(),
    waistCircumferenceCm: assessment.getWaistCircumference()?.toString() ?? null,
    hipCircumferenceCm: assessment.getHipCircumference()?.toString() ?? null,
    abdominalCircumferenceCm:
      assessment.getAbdominalCircumference()?.toString() ?? null,
    neckCircumferenceCm: assessment.getNeckCircumference()?.toString() ?? null,
    armCircumferenceCm: assessment.getArmCircumference()?.toString() ?? null,
    calfCircumferenceCm: assessment.getCalfCircumference()?.toString() ?? null,
    waistToHipRatio: assessment.getWaistToHipRatio()?.toString() ?? null,
    notes: assessment.getNotes().toString(),
    measuredAt: assessment.getMeasuredAt().toISOString(),
    version: assessment.getVersion(),
    createdAt: assessment.getCreatedAt().toISOString(),
  };
}
