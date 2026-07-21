import type { ClinicalObjective } from '../domain/aggregates/clinical-objective.aggregate.js';
import type { ClinicalObjectivePriority } from '../domain/value-objects/clinical-objective-priority.js';
import type { ClinicalObjectiveStatus } from '../domain/value-objects/clinical-objective-status.js';

export interface ClinicalObjectiveResult {
  id: string;
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId: string | null;
  originAnamnesisId: string | null;
  type: string;
  status: ClinicalObjectiveStatus;
  priority: ClinicalObjectivePriority;
  version: number;
  title: string;
  clinicalRationale: string | null;
  successCriteria: string | null;
  targetDate: string | null;
  activatedAt: string | null;
  pausedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toClinicalObjectiveResult(
  objective: ClinicalObjective,
): ClinicalObjectiveResult {
  return {
    id: objective.getId().toString(),
    tenantId: objective.getTenantId(),
    patientId: objective.getPatientId(),
    createdByNutritionistId: objective.getCreatedByNutritionistId(),
    responsibleNutritionistId: objective.getResponsibleNutritionistId(),
    originClinicalEncounterId: objective.getOriginClinicalEncounterId(),
    originAnamnesisId: objective.getOriginAnamnesisId(),
    type: objective.getType().toString(),
    status: objective.getStatus(),
    priority: objective.getPriority(),
    version: objective.getVersion(),
    title: objective.getTitle().toPersistence(),
    clinicalRationale: objective.getClinicalRationale().toPersistence(),
    successCriteria: objective.getSuccessCriteria().toPersistence(),
    targetDate: objective.getTargetDate()?.toISOString() ?? null,
    activatedAt: objective.getActivatedAt()?.toISOString() ?? null,
    pausedAt: objective.getPausedAt()?.toISOString() ?? null,
    completedAt: objective.getCompletedAt()?.toISOString() ?? null,
    cancelledAt: objective.getCancelledAt()?.toISOString() ?? null,
    createdAt: objective.getCreatedAt().toISOString(),
    updatedAt: objective.getUpdatedAt().toISOString(),
  };
}
