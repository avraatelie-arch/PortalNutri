import type { ClinicalObjective } from '../aggregates/clinical-objective.aggregate.js';
import type { ClinicalObjectiveId } from '../value-objects/clinical-objective-id.js';
import type { ClinicalObjectiveStatus } from '../value-objects/clinical-objective-status.js';

export interface ClinicalObjectiveRepository {
  save(objective: ClinicalObjective): Promise<void>;
  findByTenantAndId(
    tenantId: string,
    id: ClinicalObjectiveId,
  ): Promise<ClinicalObjective | null>;
  findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: ClinicalObjectiveStatus[],
  ): Promise<ClinicalObjective[]>;
  findActiveByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<ClinicalObjective[]>;
  findByResponsibleNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<ClinicalObjective[]>;
  findByOriginClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<ClinicalObjective[]>;
  findByStatus(
    tenantId: string,
    status: ClinicalObjectiveStatus,
  ): Promise<ClinicalObjective[]>;
}
