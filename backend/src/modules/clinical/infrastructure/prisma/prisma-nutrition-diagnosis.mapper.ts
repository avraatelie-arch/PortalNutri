import type { NutritionDiagnosis as NutritionDiagnosisRecord } from '@prisma/client';
import { NutritionDiagnosis } from '../../domain/aggregates/nutrition-diagnosis.aggregate.js';
import { CancellationReason } from '../../domain/value-objects/cancellation-reason.js';
import { NutritionDiagnosisId } from '../../domain/value-objects/nutrition-diagnosis-id.js';
import { parseNutritionDiagnosisStatus } from '../../domain/value-objects/nutrition-diagnosis-status.js';
import { NutritionProblemCategory } from '../../domain/value-objects/nutrition-problem-category.js';
import { ProfessionalInterpretation } from '../../domain/value-objects/professional-interpretation.js';

export type NutritionDiagnosisPersistenceInput = {
  id: string;
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId: string | null;
  originAnamnesisId: string | null;
  problemCategory: NutritionDiagnosisRecord['problemCategory'];
  status: NutritionDiagnosisRecord['status'];
  professionalInterpretation: string | null;
  cancellationReason: string | null;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export function toPersistence(
  diagnosis: NutritionDiagnosis,
): NutritionDiagnosisPersistenceInput {
  return {
    id: diagnosis.getId().toString(),
    tenantId: diagnosis.getTenantId(),
    patientId: diagnosis.getPatientId(),
    createdByNutritionistId: diagnosis.getCreatedByNutritionistId(),
    responsibleNutritionistId: diagnosis.getResponsibleNutritionistId(),
    originClinicalEncounterId: diagnosis.getOriginClinicalEncounterId(),
    originAnamnesisId: diagnosis.getOriginAnamnesisId(),
    problemCategory: diagnosis.getProblemCategory().toString() as NutritionDiagnosisRecord['problemCategory'],
    status: diagnosis.getStatus() as NutritionDiagnosisRecord['status'],
    professionalInterpretation: diagnosis.getProfessionalInterpretation().toPersistence(),
    cancellationReason: diagnosis.getCancellationReason()?.toPersistence() ?? null,
    confirmedAt: diagnosis.getConfirmedAt(),
    cancelledAt: diagnosis.getCancelledAt(),
    version: diagnosis.getVersion(),
    createdAt: diagnosis.getCreatedAt(),
    updatedAt: diagnosis.getUpdatedAt(),
  };
}

export function toDomain(record: NutritionDiagnosisRecord): NutritionDiagnosis {
  return NutritionDiagnosis.reconstitute({
    id: NutritionDiagnosisId.create(record.id),
    tenantId: record.tenantId,
    patientId: record.patientId,
    createdByNutritionistId: record.createdByNutritionistId,
    responsibleNutritionistId: record.responsibleNutritionistId,
    originClinicalEncounterId: record.originClinicalEncounterId,
    originAnamnesisId: record.originAnamnesisId,
    problemCategory: NutritionProblemCategory.parse(record.problemCategory),
    status: parseNutritionDiagnosisStatus(record.status),
    version: record.version,
    professionalInterpretation: ProfessionalInterpretation.fromPersistence(
      record.professionalInterpretation,
    ),
    cancellationReason: CancellationReason.fromPersistence(record.cancellationReason),
    confirmedAt: record.confirmedAt,
    cancelledAt: record.cancelledAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}
