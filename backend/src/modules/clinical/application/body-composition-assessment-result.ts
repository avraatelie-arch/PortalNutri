import type { BodyCompositionAssessment } from '../domain/aggregates/body-composition-assessment.aggregate.js';
import type { BodyCompositionMeasurementSourceValue } from '../domain/value-objects/body-composition-measurement-source.js';

export interface BodyCompositionAssessmentResult {
  id: string;
  tenantId: string;
  anamnesisId: string;
  clinicalEncounterId: string;
  patientId: string;
  nutritionistId: string;
  anthropometricAssessmentId: string | null;
  sourceRequestId: string | null;
  bodyFatPercentage: string;
  leanMassKg: string | null;
  fatMassKg: string | null;
  muscleMassKg: string | null;
  boneMassKg: string | null;
  bodyWaterPercentage: string | null;
  visceralFatLevel: string | null;
  basalMetabolicRate: string | null;
  metabolicAge: string | null;
  notes: string | null;
  measurementSource: BodyCompositionMeasurementSourceValue;
  measuredAt: string;
  version: number;
  createdAt: string;
}

export function toBodyCompositionAssessmentResult(
  assessment: BodyCompositionAssessment,
): BodyCompositionAssessmentResult {
  return {
    id: assessment.getId().toString(),
    tenantId: assessment.getTenantId(),
    anamnesisId: assessment.getAnamnesisId(),
    clinicalEncounterId: assessment.getClinicalEncounterId(),
    patientId: assessment.getPatientId(),
    nutritionistId: assessment.getNutritionistId(),
    anthropometricAssessmentId: assessment.getAnthropometricAssessmentId(),
    sourceRequestId: assessment.getSourceRequestId()?.toString() ?? null,
    bodyFatPercentage: assessment.getBodyFatPercentage().toString(),
    leanMassKg: assessment.getLeanMass()?.toString() ?? null,
    fatMassKg: assessment.getFatMass()?.toString() ?? null,
    muscleMassKg: assessment.getMuscleMass()?.toString() ?? null,
    boneMassKg: assessment.getBoneMass()?.toString() ?? null,
    bodyWaterPercentage: assessment.getBodyWaterPercentage()?.toString() ?? null,
    visceralFatLevel: assessment.getVisceralFatLevel()?.toString() ?? null,
    basalMetabolicRate: assessment.getBasalMetabolicRate()?.toString() ?? null,
    metabolicAge: assessment.getMetabolicAge()?.toString() ?? null,
    notes: assessment.getNotes().toString(),
    measurementSource: assessment.getMeasurementSource().toString(),
    measuredAt: assessment.getMeasuredAt().toISOString(),
    version: assessment.getVersion(),
    createdAt: assessment.getCreatedAt().toISOString(),
  };
}
