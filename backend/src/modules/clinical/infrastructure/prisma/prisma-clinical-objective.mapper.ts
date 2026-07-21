import type { ClinicalObjective as ClinicalObjectiveRecord } from '@prisma/client';
import { ClinicalObjective } from '../../domain/aggregates/clinical-objective.aggregate.js';
import { ClinicalObjectiveId } from '../../domain/value-objects/clinical-objective-id.js';
import { parseClinicalObjectivePriority } from '../../domain/value-objects/clinical-objective-priority.js';
import { parseClinicalObjectiveStatus } from '../../domain/value-objects/clinical-objective-status.js';
import { ClinicalObjectiveTitle } from '../../domain/value-objects/clinical-objective-title.js';
import { ClinicalObjectiveType } from '../../domain/value-objects/clinical-objective-type.js';
import { ClinicalRationale } from '../../domain/value-objects/clinical-rationale.js';
import { SuccessCriteria } from '../../domain/value-objects/success-criteria.js';

export type ClinicalObjectivePersistenceInput = {
  id: string;
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId: string | null;
  originAnamnesisId: string | null;
  type: ClinicalObjectiveRecord['type'];
  status: ClinicalObjectiveRecord['status'];
  priority: ClinicalObjectiveRecord['priority'];
  title: string;
  clinicalRationale: string | null;
  successCriteria: string | null;
  targetDate: Date | null;
  activatedAt: Date | null;
  pausedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export function toPersistence(
  objective: ClinicalObjective,
): ClinicalObjectivePersistenceInput {
  return {
    id: objective.getId().toString(),
    tenantId: objective.getTenantId(),
    patientId: objective.getPatientId(),
    createdByNutritionistId: objective.getCreatedByNutritionistId(),
    responsibleNutritionistId: objective.getResponsibleNutritionistId(),
    originClinicalEncounterId: objective.getOriginClinicalEncounterId(),
    originAnamnesisId: objective.getOriginAnamnesisId(),
    type: objective.getType().toString() as ClinicalObjectiveRecord['type'],
    status: objective.getStatus() as ClinicalObjectiveRecord['status'],
    priority: objective.getPriority() as ClinicalObjectiveRecord['priority'],
    title: objective.getTitle().toPersistence(),
    clinicalRationale: objective.getClinicalRationale().toPersistence(),
    successCriteria: objective.getSuccessCriteria().toPersistence(),
    targetDate: objective.getTargetDate(),
    activatedAt: objective.getActivatedAt(),
    pausedAt: objective.getPausedAt(),
    completedAt: objective.getCompletedAt(),
    cancelledAt: objective.getCancelledAt(),
    version: objective.getVersion(),
    createdAt: objective.getCreatedAt(),
    updatedAt: objective.getUpdatedAt(),
  };
}

export function toDomain(record: ClinicalObjectiveRecord): ClinicalObjective {
  return ClinicalObjective.reconstitute({
    id: ClinicalObjectiveId.create(record.id),
    tenantId: record.tenantId,
    patientId: record.patientId,
    createdByNutritionistId: record.createdByNutritionistId,
    responsibleNutritionistId: record.responsibleNutritionistId,
    originClinicalEncounterId: record.originClinicalEncounterId,
    originAnamnesisId: record.originAnamnesisId,
    type: ClinicalObjectiveType.parse(record.type),
    status: parseClinicalObjectiveStatus(record.status),
    priority: parseClinicalObjectivePriority(record.priority),
    version: record.version,
    title: ClinicalObjectiveTitle.fromPersistence(record.title),
    clinicalRationale: ClinicalRationale.fromPersistence(record.clinicalRationale),
    successCriteria: SuccessCriteria.fromPersistence(record.successCriteria),
    targetDate: record.targetDate,
    activatedAt: record.activatedAt,
    pausedAt: record.pausedAt,
    completedAt: record.completedAt,
    cancelledAt: record.cancelledAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}
