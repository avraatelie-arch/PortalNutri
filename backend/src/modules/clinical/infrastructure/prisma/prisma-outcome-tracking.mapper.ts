import type { OutcomeTracking as OutcomeTrackingRecord } from '@prisma/client';
import {
  AdherenceFactor as PrismaAdherenceFactor,
  OutcomeAssessment as PrismaOutcomeAssessment,
  OutcomeTrackingStatus as PrismaOutcomeTrackingStatus,
} from '@prisma/client';
import { OutcomeTracking } from '../../domain/aggregates/outcome-tracking.aggregate.js';
import { AdherenceFactor } from '../../domain/value-objects/adherence-factor.js';
import { OutcomeAssessment } from '../../domain/value-objects/outcome-assessment.js';
import {
  OutcomeClinicalNotes,
  ProfessionalRationale,
} from '../../domain/value-objects/outcome-assessment-text.js';
import { OutcomeTrackingId } from '../../domain/value-objects/outcome-tracking-id.js';
import {
  parseOutcomeTrackingStatus,
  type OutcomeTrackingStatus,
} from '../../domain/value-objects/outcome-tracking-status.js';

export type OutcomeTrackingPersistenceInput = {
  id: string;
  tenantId: string;
  patientId: string;
  clinicalObjectiveId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId: string | null;
  originAnamnesisId: string | null;
  status: PrismaOutcomeTrackingStatus;
  version: number;
  clinicalMomentAt: Date | null;
  outcomeAssessment: PrismaOutcomeAssessment | null;
  adherenceFactor: PrismaAdherenceFactor | null;
  professionalRationale: string | null;
  clinicalNotes: string | null;
  evaluatedAt: Date | null;
  recordedAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toPersistence(
  tracking: OutcomeTracking,
): OutcomeTrackingPersistenceInput {
  return {
    id: tracking.getId().toString(),
    tenantId: tracking.getTenantId(),
    patientId: tracking.getPatientId(),
    clinicalObjectiveId: tracking.getClinicalObjectiveId(),
    createdByNutritionistId: tracking.getCreatedByNutritionistId(),
    responsibleNutritionistId: tracking.getResponsibleNutritionistId(),
    originClinicalEncounterId: tracking.getOriginClinicalEncounterId(),
    originAnamnesisId: tracking.getOriginAnamnesisId(),
    status: toPrismaStatus(tracking.getStatus()),
    version: tracking.getVersion(),
    clinicalMomentAt: tracking.getClinicalMomentAt(),
    outcomeAssessment: tracking.getOutcomeAssessment()
      ? (tracking.getOutcomeAssessment()!.toString() as PrismaOutcomeAssessment)
      : null,
    adherenceFactor: tracking.getAdherenceFactor()
      ? (tracking.getAdherenceFactor()!.toString() as PrismaAdherenceFactor)
      : null,
    professionalRationale: tracking.getProfessionalRationale().toPersistence(),
    clinicalNotes: tracking.getClinicalNotes().toPersistence(),
    evaluatedAt: tracking.getEvaluatedAt(),
    recordedAt: tracking.getRecordedAt(),
    cancelledAt: tracking.getCancelledAt(),
    createdAt: tracking.getCreatedAt(),
    updatedAt: tracking.getUpdatedAt(),
  };
}

export function toDomain(record: OutcomeTrackingRecord): OutcomeTracking {
  return OutcomeTracking.reconstitute({
    id: OutcomeTrackingId.create(record.id),
    tenantId: record.tenantId,
    patientId: record.patientId,
    clinicalObjectiveId: record.clinicalObjectiveId,
    createdByNutritionistId: record.createdByNutritionistId,
    responsibleNutritionistId: record.responsibleNutritionistId,
    originClinicalEncounterId: record.originClinicalEncounterId,
    originAnamnesisId: record.originAnamnesisId,
    clinicalMomentAt: record.clinicalMomentAt,
    status: toDomainStatus(record.status),
    version: record.version,
    outcomeAssessment: record.outcomeAssessment
      ? OutcomeAssessment.parse(record.outcomeAssessment)
      : null,
    adherenceFactor: record.adherenceFactor
      ? AdherenceFactor.parse(record.adherenceFactor)
      : null,
    professionalRationale: ProfessionalRationale.fromPersistence(
      record.professionalRationale,
    ),
    clinicalNotes: OutcomeClinicalNotes.fromPersistence(record.clinicalNotes),
    evaluatedAt: record.evaluatedAt,
    recordedAt: record.recordedAt,
    cancelledAt: record.cancelledAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

function toPrismaStatus(status: OutcomeTrackingStatus): PrismaOutcomeTrackingStatus {
  return status as PrismaOutcomeTrackingStatus;
}

function toDomainStatus(status: PrismaOutcomeTrackingStatus): OutcomeTrackingStatus {
  return parseOutcomeTrackingStatus(status);
}
