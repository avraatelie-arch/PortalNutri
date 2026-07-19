import type { ClinicalEncounter } from '../aggregates/clinical-encounter.aggregate.js';
import type { ClinicalEncounterId } from '../value-objects/clinical-encounter-id.js';

export interface ClinicalEncounterRepository {
  save(encounter: ClinicalEncounter): Promise<void>;
  findByTenantAndId(
    tenantId: string,
    id: ClinicalEncounterId,
  ): Promise<ClinicalEncounter | null>;
  findByAppointment(
    tenantId: string,
    appointmentId: string,
  ): Promise<ClinicalEncounter | null>;
  findByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<ClinicalEncounter[]>;
  findByNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<ClinicalEncounter[]>;
  findOpenEncounter(
    tenantId: string,
    patientId: string,
    nutritionistId: string,
  ): Promise<ClinicalEncounter | null>;
}
