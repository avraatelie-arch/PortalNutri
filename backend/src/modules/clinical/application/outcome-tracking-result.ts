import type { OutcomeTracking } from '../domain/aggregates/outcome-tracking.aggregate.js';
import type { OutcomeTrackingStatus } from '../domain/value-objects/outcome-tracking-status.js';

export interface OutcomeTrackingResult {
  id: string;
  tenantId: string;
  patientId: string;
  clinicalObjectiveId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId: string | null;
  originAnamnesisId: string | null;
  clinicalMomentAt: string | null;
  status: OutcomeTrackingStatus;
  version: number;
  outcomeAssessment: string | null;
  adherenceFactor: string | null;
  professionalRationale: string | null;
  clinicalNotes: string | null;
  evaluatedAt: string | null;
  recordedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toOutcomeTrackingResult(
  tracking: OutcomeTracking,
): OutcomeTrackingResult {
  return {
    id: tracking.getId().toString(),
    tenantId: tracking.getTenantId(),
    patientId: tracking.getPatientId(),
    clinicalObjectiveId: tracking.getClinicalObjectiveId(),
    createdByNutritionistId: tracking.getCreatedByNutritionistId(),
    responsibleNutritionistId: tracking.getResponsibleNutritionistId(),
    originClinicalEncounterId: tracking.getOriginClinicalEncounterId(),
    originAnamnesisId: tracking.getOriginAnamnesisId(),
    clinicalMomentAt: tracking.getClinicalMomentAt()?.toISOString() ?? null,
    status: tracking.getStatus(),
    version: tracking.getVersion(),
    outcomeAssessment: tracking.getOutcomeAssessment()?.toString() ?? null,
    adherenceFactor: tracking.getAdherenceFactor()?.toString() ?? null,
    professionalRationale: tracking.getProfessionalRationale().toPersistence(),
    clinicalNotes: tracking.getClinicalNotes().toPersistence(),
    evaluatedAt: tracking.getEvaluatedAt()?.toISOString() ?? null,
    recordedAt: tracking.getRecordedAt()?.toISOString() ?? null,
    cancelledAt: tracking.getCancelledAt()?.toISOString() ?? null,
    createdAt: tracking.getCreatedAt().toISOString(),
    updatedAt: tracking.getUpdatedAt().toISOString(),
  };
}
