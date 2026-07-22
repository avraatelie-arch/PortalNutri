import type { ClinicalEvolution } from '../aggregates/clinical-evolution.aggregate.js';
import type { ClinicalEvolutionId } from '../value-objects/clinical-evolution-id.js';
import type { ClinicalEvolutionStatus } from '../value-objects/clinical-evolution-status.js';

export interface ClinicalEvolutionRepository {
  save(evolution: ClinicalEvolution): Promise<void>;
  findByTenantAndId(
    tenantId: string,
    id: ClinicalEvolutionId,
  ): Promise<ClinicalEvolution | null>;
  existsByClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<boolean>;
  findByClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<ClinicalEvolution | null>;
  findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: ClinicalEvolutionStatus[],
  ): Promise<ClinicalEvolution[]>;
  findLatestFinalizedByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<ClinicalEvolution | null>;
  findPreviousFinalized(
    tenantId: string,
    patientId: string,
    currentClinicalMomentAt: Date,
    currentClinicalEncounterId: string,
    excludeEvolutionId?: ClinicalEvolutionId,
  ): Promise<ClinicalEvolution | null>;
}
