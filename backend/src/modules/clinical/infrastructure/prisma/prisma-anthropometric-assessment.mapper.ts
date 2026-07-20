import type { AnthropometricAssessment as AnthropometricAssessmentRecord } from '@prisma/client';
import { BodyMassIndexClassification as PrismaBodyMassIndexClassification } from '@prisma/client';
import { AnthropometricAssessment } from '../../domain/aggregates/anthropometric-assessment.aggregate.js';
import { AnthropometricAssessmentId } from '../../domain/value-objects/anthropometric-assessment-id.js';
import { AnthropometricNotes } from '../../domain/value-objects/anthropometric-notes.js';
import { BodyCircumference } from '../../domain/value-objects/body-circumference.js';
import { BodyHeight } from '../../domain/value-objects/body-height.js';
import { BodyMassIndex } from '../../domain/value-objects/body-mass-index.js';
import {
  type BodyMassIndexClassification,
  parseBodyMassIndexClassification,
} from '../../domain/value-objects/body-mass-index-classification.js';
import { BodyWeight } from '../../domain/value-objects/body-weight.js';
import { ClinicalSourceRequestId } from '../../domain/value-objects/clinical-source-request-id.js';
import { decimalFromPrisma } from '../../domain/value-objects/clinical-decimal-utils.js';
import { WaistToHipRatio } from '../../domain/value-objects/waist-to-hip-ratio.js';

export type AnthropometricAssessmentPersistenceInput = {
  id: string;
  tenantId: string;
  anamnesisId: string;
  clinicalEncounterId: string;
  patientId: string;
  nutritionistId: string;
  sourceRequestId: string | null;
  weightKg: AnthropometricAssessmentRecord['weightKg'];
  heightCm: AnthropometricAssessmentRecord['heightCm'];
  bodyMassIndex: AnthropometricAssessmentRecord['bodyMassIndex'];
  bodyMassIndexClassification: PrismaBodyMassIndexClassification;
  waistCircumferenceCm: AnthropometricAssessmentRecord['waistCircumferenceCm'];
  hipCircumferenceCm: AnthropometricAssessmentRecord['hipCircumferenceCm'];
  abdominalCircumferenceCm: AnthropometricAssessmentRecord['abdominalCircumferenceCm'];
  neckCircumferenceCm: AnthropometricAssessmentRecord['neckCircumferenceCm'];
  armCircumferenceCm: AnthropometricAssessmentRecord['armCircumferenceCm'];
  calfCircumferenceCm: AnthropometricAssessmentRecord['calfCircumferenceCm'];
  waistToHipRatio: AnthropometricAssessmentRecord['waistToHipRatio'];
  notes: string | null;
  measuredAt: Date;
  version: number;
  createdAt: Date;
};

export function toPersistence(
  assessment: AnthropometricAssessment,
): AnthropometricAssessmentPersistenceInput {
  return {
    id: assessment.getId().toString(),
    tenantId: assessment.getTenantId(),
    anamnesisId: assessment.getAnamnesisId(),
    clinicalEncounterId: assessment.getClinicalEncounterId(),
    patientId: assessment.getPatientId(),
    nutritionistId: assessment.getNutritionistId(),
    sourceRequestId: assessment.getSourceRequestId()?.toString() ?? null,
    weightKg: assessment.getWeight().getValue(),
    heightCm: assessment.getHeight().getValue(),
    bodyMassIndex: assessment.getBodyMassIndex().getValue(),
    bodyMassIndexClassification: toPrismaClassification(
      assessment.getBodyMassIndexClassification(),
    ),
    waistCircumferenceCm: assessment.getWaistCircumference()?.getValue() ?? null,
    hipCircumferenceCm: assessment.getHipCircumference()?.getValue() ?? null,
    abdominalCircumferenceCm:
      assessment.getAbdominalCircumference()?.getValue() ?? null,
    neckCircumferenceCm: assessment.getNeckCircumference()?.getValue() ?? null,
    armCircumferenceCm: assessment.getArmCircumference()?.getValue() ?? null,
    calfCircumferenceCm: assessment.getCalfCircumference()?.getValue() ?? null,
    waistToHipRatio: assessment.getWaistToHipRatio()?.getValue() ?? null,
    notes: assessment.getNotes().toPersistence(),
    measuredAt: assessment.getMeasuredAt(),
    version: assessment.getVersion(),
    createdAt: assessment.getCreatedAt(),
  };
}

export function toDomain(
  record: AnthropometricAssessmentRecord,
): AnthropometricAssessment {
  return AnthropometricAssessment.reconstitute({
    id: AnthropometricAssessmentId.create(record.id),
    tenantId: record.tenantId,
    anamnesisId: record.anamnesisId,
    clinicalEncounterId: record.clinicalEncounterId,
    patientId: record.patientId,
    nutritionistId: record.nutritionistId,
    weight: BodyWeight.fromDecimal(decimalFromPrisma(record.weightKg)),
    height: BodyHeight.fromDecimal(decimalFromPrisma(record.heightCm)),
    bodyMassIndex: BodyMassIndex.fromDecimal(decimalFromPrisma(record.bodyMassIndex)),
    bodyMassIndexClassification: parseBodyMassIndexClassification(
      record.bodyMassIndexClassification,
    ),
    waistCircumference: record.waistCircumferenceCm
      ? BodyCircumference.fromDecimal(decimalFromPrisma(record.waistCircumferenceCm))
      : null,
    hipCircumference: record.hipCircumferenceCm
      ? BodyCircumference.fromDecimal(decimalFromPrisma(record.hipCircumferenceCm))
      : null,
    abdominalCircumference: record.abdominalCircumferenceCm
      ? BodyCircumference.fromDecimal(decimalFromPrisma(record.abdominalCircumferenceCm))
      : null,
    neckCircumference: record.neckCircumferenceCm
      ? BodyCircumference.fromDecimal(decimalFromPrisma(record.neckCircumferenceCm))
      : null,
    armCircumference: record.armCircumferenceCm
      ? BodyCircumference.fromDecimal(decimalFromPrisma(record.armCircumferenceCm))
      : null,
    calfCircumference: record.calfCircumferenceCm
      ? BodyCircumference.fromDecimal(decimalFromPrisma(record.calfCircumferenceCm))
      : null,
    waistToHipRatio: record.waistToHipRatio
      ? WaistToHipRatio.fromDecimal(decimalFromPrisma(record.waistToHipRatio))
      : null,
    notes: AnthropometricNotes.fromPersistence(record.notes),
    sourceRequestId: record.sourceRequestId
      ? ClinicalSourceRequestId.fromPersistence(record.sourceRequestId)
      : null,
    measuredAt: record.measuredAt,
    version: record.version,
    createdAt: record.createdAt,
  });
}

function toPrismaClassification(
  classification: BodyMassIndexClassification,
): PrismaBodyMassIndexClassification {
  return classification as PrismaBodyMassIndexClassification;
}
