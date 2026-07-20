import type { BodyCompositionAssessment as BodyCompositionAssessmentRecord } from '@prisma/client';
import { BodyCompositionMeasurementSource as PrismaBodyCompositionMeasurementSource } from '@prisma/client';
import { BodyCompositionAssessment } from '../../domain/aggregates/body-composition-assessment.aggregate.js';
import { BodyCompositionAssessmentId } from '../../domain/value-objects/body-composition-assessment-id.js';
import { BasalMetabolicRate } from '../../domain/value-objects/basal-metabolic-rate.js';
import {
  BodyCompositionMeasurementSource,
  type BodyCompositionMeasurementSourceValue,
} from '../../domain/value-objects/body-composition-measurement-source.js';
import { BodyCompositionNotes } from '../../domain/value-objects/body-composition-notes.js';
import { BodyFatPercentage } from '../../domain/value-objects/body-fat-percentage.js';
import { BodyWaterPercentage } from '../../domain/value-objects/body-water-percentage.js';
import { BoneMass } from '../../domain/value-objects/bone-mass.js';
import { ClinicalSourceRequestId } from '../../domain/value-objects/clinical-source-request-id.js';
import { decimalFromPrisma } from '../../domain/value-objects/clinical-decimal-utils.js';
import { FatMass } from '../../domain/value-objects/fat-mass.js';
import { LeanMass } from '../../domain/value-objects/lean-mass.js';
import { MetabolicAge } from '../../domain/value-objects/metabolic-age.js';
import { MuscleMass } from '../../domain/value-objects/muscle-mass.js';
import { VisceralFatLevel } from '../../domain/value-objects/visceral-fat-level.js';

export type BodyCompositionAssessmentPersistenceInput = {
  id: string;
  tenantId: string;
  anamnesisId: string;
  clinicalEncounterId: string;
  patientId: string;
  nutritionistId: string;
  anthropometricAssessmentId: string | null;
  sourceRequestId: string | null;
  bodyFatPercentage: BodyCompositionAssessmentRecord['bodyFatPercentage'];
  leanMassKg: BodyCompositionAssessmentRecord['leanMassKg'];
  fatMassKg: BodyCompositionAssessmentRecord['fatMassKg'];
  muscleMassKg: BodyCompositionAssessmentRecord['muscleMassKg'];
  boneMassKg: BodyCompositionAssessmentRecord['boneMassKg'];
  bodyWaterPercentage: BodyCompositionAssessmentRecord['bodyWaterPercentage'];
  visceralFatLevel: BodyCompositionAssessmentRecord['visceralFatLevel'];
  basalMetabolicRate: number | null;
  metabolicAge: number | null;
  notes: string | null;
  measurementSource: PrismaBodyCompositionMeasurementSource;
  measuredAt: Date;
  version: number;
  createdAt: Date;
};

export function toPersistence(
  assessment: BodyCompositionAssessment,
): BodyCompositionAssessmentPersistenceInput {
  return {
    id: assessment.getId().toString(),
    tenantId: assessment.getTenantId(),
    anamnesisId: assessment.getAnamnesisId(),
    clinicalEncounterId: assessment.getClinicalEncounterId(),
    patientId: assessment.getPatientId(),
    nutritionistId: assessment.getNutritionistId(),
    anthropometricAssessmentId: assessment.getAnthropometricAssessmentId(),
    sourceRequestId: assessment.getSourceRequestId()?.toString() ?? null,
    bodyFatPercentage: assessment.getBodyFatPercentage().getValue(),
    leanMassKg: assessment.getLeanMass()?.getValue() ?? null,
    fatMassKg: assessment.getFatMass()?.getValue() ?? null,
    muscleMassKg: assessment.getMuscleMass()?.getValue() ?? null,
    boneMassKg: assessment.getBoneMass()?.getValue() ?? null,
    bodyWaterPercentage: assessment.getBodyWaterPercentage()?.getValue() ?? null,
    visceralFatLevel: assessment.getVisceralFatLevel()?.getValue() ?? null,
    basalMetabolicRate: assessment.getBasalMetabolicRate()?.getValue() ?? null,
    metabolicAge: assessment.getMetabolicAge()?.getValue() ?? null,
    notes: assessment.getNotes().toPersistence(),
    measurementSource: toPrismaMeasurementSource(
      assessment.getMeasurementSource().toString(),
    ),
    measuredAt: assessment.getMeasuredAt(),
    version: assessment.getVersion(),
    createdAt: assessment.getCreatedAt(),
  };
}

export function toDomain(
  record: BodyCompositionAssessmentRecord,
): BodyCompositionAssessment {
  return BodyCompositionAssessment.reconstitute({
    id: BodyCompositionAssessmentId.create(record.id),
    tenantId: record.tenantId,
    anamnesisId: record.anamnesisId,
    clinicalEncounterId: record.clinicalEncounterId,
    patientId: record.patientId,
    nutritionistId: record.nutritionistId,
    anthropometricAssessmentId: record.anthropometricAssessmentId,
    bodyFatPercentage: BodyFatPercentage.fromDecimal(
      decimalFromPrisma(record.bodyFatPercentage),
    ),
    leanMass: record.leanMassKg
      ? LeanMass.fromDecimal(decimalFromPrisma(record.leanMassKg))
      : null,
    fatMass: record.fatMassKg
      ? FatMass.fromDecimal(decimalFromPrisma(record.fatMassKg))
      : null,
    muscleMass: record.muscleMassKg
      ? MuscleMass.fromDecimal(decimalFromPrisma(record.muscleMassKg))
      : null,
    boneMass: record.boneMassKg
      ? BoneMass.fromDecimal(decimalFromPrisma(record.boneMassKg))
      : null,
    bodyWaterPercentage: record.bodyWaterPercentage
      ? BodyWaterPercentage.fromDecimal(decimalFromPrisma(record.bodyWaterPercentage))
      : null,
    visceralFatLevel: record.visceralFatLevel
      ? VisceralFatLevel.fromDecimal(decimalFromPrisma(record.visceralFatLevel))
      : null,
    basalMetabolicRate:
      record.basalMetabolicRate !== null
        ? BasalMetabolicRate.fromPersistence(record.basalMetabolicRate)
        : null,
    metabolicAge:
      record.metabolicAge !== null
        ? MetabolicAge.fromPersistence(record.metabolicAge)
        : null,
    notes: BodyCompositionNotes.fromPersistence(record.notes),
    measurementSource: BodyCompositionMeasurementSource.fromPersistence(
      parseMeasurementSource(record.measurementSource),
    ),
    sourceRequestId: record.sourceRequestId
      ? ClinicalSourceRequestId.fromPersistence(record.sourceRequestId)
      : null,
    measuredAt: record.measuredAt,
    version: record.version,
    createdAt: record.createdAt,
  });
}

function toPrismaMeasurementSource(
  source: BodyCompositionMeasurementSourceValue,
): PrismaBodyCompositionMeasurementSource {
  return source as PrismaBodyCompositionMeasurementSource;
}

function parseMeasurementSource(
  source: PrismaBodyCompositionMeasurementSource,
): BodyCompositionMeasurementSourceValue {
  return source as BodyCompositionMeasurementSourceValue;
}
