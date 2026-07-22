import type { ClinicalEvolutionRepository } from '../../domain/repositories/clinical-evolution-repository.js';
import type { ClinicalEvolution } from '../../domain/aggregates/clinical-evolution.aggregate.js';
import type { ClinicalEvolutionId } from '../../domain/value-objects/clinical-evolution-id.js';
import { ClinicalEvolutionStatusValue } from '../../domain/value-objects/clinical-evolution-status.js';
import type { ClinicalEvolutionStatus } from '../../domain/value-objects/clinical-evolution-status.js';
import {
  findLatestFinalizedByChronology,
  findPreviousFinalizedBeforeChronology,
  sortClinicalEvolutionsByChronology,
} from './clinical-evolution-chronology.js';

export class InMemoryClinicalEvolutionRepository implements ClinicalEvolutionRepository {
  private readonly records = new Map<string, ClinicalEvolution>();

  async save(evolution: ClinicalEvolution): Promise<void> {
    this.records.set(evolution.getId().toString(), evolution);
  }

  async findByTenantAndId(
    tenantId: string,
    id: ClinicalEvolutionId,
  ): Promise<ClinicalEvolution | null> {
    const evolution = this.records.get(id.toString());

    if (!evolution || evolution.getTenantId() !== tenantId) {
      return null;
    }

    return evolution;
  }

  async existsByClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<boolean> {
    return [...this.records.values()].some(
      (evolution) =>
        evolution.getTenantId() === tenantId
        && evolution.getClinicalEncounterId() === clinicalEncounterId,
    );
  }

  async findByClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<ClinicalEvolution | null> {
    return (
      [...this.records.values()].find(
        (evolution) =>
          evolution.getTenantId() === tenantId
          && evolution.getClinicalEncounterId() === clinicalEncounterId,
      ) ?? null
    );
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: ClinicalEvolutionStatus[],
  ): Promise<ClinicalEvolution[]> {
    const matches = [...this.records.values()].filter((evolution) => {
      if (evolution.getTenantId() !== tenantId || evolution.getPatientId() !== patientId) {
        return false;
      }

      if (statuses && !statuses.includes(evolution.getStatus())) {
        return false;
      }

      return true;
    });

    return sortClinicalEvolutionsByChronology(matches);
  }

  async findLatestFinalizedByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<ClinicalEvolution | null> {
    const finalized = await this.findByPatient(tenantId, patientId, [
      ClinicalEvolutionStatusValue.Finalized,
    ]);

    return findLatestFinalizedByChronology(finalized);
  }

  async findPreviousFinalized(
    tenantId: string,
    patientId: string,
    currentClinicalMomentAt: Date,
    currentClinicalEncounterId: string,
    excludeEvolutionId?: ClinicalEvolutionId,
  ): Promise<ClinicalEvolution | null> {
    const finalized = await this.findByPatient(tenantId, patientId, [
      ClinicalEvolutionStatusValue.Finalized,
    ]);

    return findPreviousFinalizedBeforeChronology(
      finalized,
      currentClinicalMomentAt,
      currentClinicalEncounterId,
      excludeEvolutionId?.toString(),
    );
  }
}
