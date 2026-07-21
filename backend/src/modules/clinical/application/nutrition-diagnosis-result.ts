import type { NutritionDiagnosis } from '../domain/aggregates/nutrition-diagnosis.aggregate.js';
import type { NutritionDiagnosisStatus } from '../domain/value-objects/nutrition-diagnosis-status.js';

export interface NutritionDiagnosisResult {
  id: string;
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId: string | null;
  originAnamnesisId: string | null;
  problemCategory: string;
  status: NutritionDiagnosisStatus;
  version: number;
  professionalInterpretation: string | null;
  cancellationReason: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toNutritionDiagnosisResult(
  diagnosis: NutritionDiagnosis,
): NutritionDiagnosisResult {
  return {
    id: diagnosis.getId().toString(),
    tenantId: diagnosis.getTenantId(),
    patientId: diagnosis.getPatientId(),
    createdByNutritionistId: diagnosis.getCreatedByNutritionistId(),
    responsibleNutritionistId: diagnosis.getResponsibleNutritionistId(),
    originClinicalEncounterId: diagnosis.getOriginClinicalEncounterId(),
    originAnamnesisId: diagnosis.getOriginAnamnesisId(),
    problemCategory: diagnosis.getProblemCategory().toString(),
    status: diagnosis.getStatus(),
    version: diagnosis.getVersion(),
    professionalInterpretation: diagnosis.getProfessionalInterpretation().toPersistence(),
    cancellationReason: diagnosis.getCancellationReason()?.toPersistence() ?? null,
    confirmedAt: diagnosis.getConfirmedAt()?.toISOString() ?? null,
    cancelledAt: diagnosis.getCancelledAt()?.toISOString() ?? null,
    createdAt: diagnosis.getCreatedAt().toISOString(),
    updatedAt: diagnosis.getUpdatedAt().toISOString(),
  };
}
