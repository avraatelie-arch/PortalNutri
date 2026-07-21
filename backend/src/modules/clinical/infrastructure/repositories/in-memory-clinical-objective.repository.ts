import type { ClinicalObjective } from '../../domain/aggregates/clinical-objective.aggregate.js';
import type { ClinicalObjectiveRepository } from '../../domain/repositories/clinical-objective-repository.js';
import type { ClinicalObjectiveId } from '../../domain/value-objects/clinical-objective-id.js';
import {
  ClinicalObjectiveStatusValue,
  type ClinicalObjectiveStatus,
} from '../../domain/value-objects/clinical-objective-status.js';
import { sortClinicalObjectivesByPriority } from './clinical-objective-sort.js';

export class InMemoryClinicalObjectiveRepository implements ClinicalObjectiveRepository {
  private readonly objectives = new Map<string, ClinicalObjective>();

  async save(objective: ClinicalObjective): Promise<void> {
    this.objectives.set(objective.getId().toString(), objective);
  }

  async findByTenantAndId(
    tenantId: string,
    id: ClinicalObjectiveId,
  ): Promise<ClinicalObjective | null> {
    const objective = this.objectives.get(id.toString());

    if (!objective || objective.getTenantId() !== tenantId) {
      return null;
    }

    return objective;
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: ClinicalObjectiveStatus[],
  ): Promise<ClinicalObjective[]> {
    const matches = [...this.objectives.values()].filter((objective) => {
      if (
        objective.getTenantId() !== tenantId
        || objective.getPatientId() !== patientId
      ) {
        return false;
      }

      if (statuses && statuses.length > 0) {
        return statuses.includes(objective.getStatus());
      }

      return true;
    });

    return sortClinicalObjectivesByPriority(matches);
  }

  async findActiveByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<ClinicalObjective[]> {
    return this.findByPatient(tenantId, patientId, [
      ClinicalObjectiveStatusValue.Active,
    ]);
  }

  async findByResponsibleNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<ClinicalObjective[]> {
    const matches = [...this.objectives.values()].filter(
      (objective) =>
        objective.getTenantId() === tenantId
        && objective.getResponsibleNutritionistId() === nutritionistId,
    );

    return sortClinicalObjectivesByPriority(matches);
  }

  async findByOriginClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<ClinicalObjective[]> {
    const matches = [...this.objectives.values()].filter(
      (objective) =>
        objective.getTenantId() === tenantId
        && objective.getOriginClinicalEncounterId() === clinicalEncounterId,
    );

    return sortClinicalObjectivesByPriority(matches);
  }

  async findByStatus(
    tenantId: string,
    status: ClinicalObjectiveStatus,
  ): Promise<ClinicalObjective[]> {
    const matches = [...this.objectives.values()].filter(
      (objective) =>
        objective.getTenantId() === tenantId && objective.getStatus() === status,
    );

    return sortClinicalObjectivesByPriority(matches);
  }
}
