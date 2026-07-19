import { ClinicalEncounterStatus } from '../../domain/value-objects/clinical-encounter-status.js';
import type { ClinicalEncounterRepository } from '../../domain/repositories/clinical-encounter-repository.js';
import type { ClinicalEncounter } from '../../domain/aggregates/clinical-encounter.aggregate.js';
import type { ClinicalEncounterId } from '../../domain/value-objects/clinical-encounter-id.js';

export class InMemoryClinicalEncounterRepository
  implements ClinicalEncounterRepository
{
  private readonly encounters = new Map<string, ClinicalEncounter>();

  async save(encounter: ClinicalEncounter): Promise<void> {
    this.encounters.set(encounter.getId().toString(), encounter);
  }

  async findByTenantAndId(
    tenantId: string,
    id: ClinicalEncounterId,
  ): Promise<ClinicalEncounter | null> {
    const encounter = this.encounters.get(id.toString());

    if (!encounter || encounter.getTenantId() !== tenantId) {
      return null;
    }

    return encounter;
  }

  async findByAppointment(
    tenantId: string,
    appointmentId: string,
  ): Promise<ClinicalEncounter | null> {
    for (const encounter of this.encounters.values()) {
      if (
        encounter.getTenantId() === tenantId &&
        encounter.getAppointmentId() === appointmentId
      ) {
        return encounter;
      }
    }

    return null;
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<ClinicalEncounter[]> {
    return [...this.encounters.values()].filter(
      (encounter) =>
        encounter.getTenantId() === tenantId &&
        encounter.getPatientId() === patientId,
    );
  }

  async findByNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<ClinicalEncounter[]> {
    return [...this.encounters.values()].filter(
      (encounter) =>
        encounter.getTenantId() === tenantId &&
        encounter.getNutritionistId() === nutritionistId,
    );
  }

  async findOpenEncounter(
    tenantId: string,
    patientId: string,
    nutritionistId: string,
  ): Promise<ClinicalEncounter | null> {
    for (const encounter of this.encounters.values()) {
      if (
        encounter.getTenantId() === tenantId &&
        encounter.getPatientId() === patientId &&
        encounter.getNutritionistId() === nutritionistId &&
        encounter.getStatus() === ClinicalEncounterStatus.Open
      ) {
        return encounter;
      }
    }

    return null;
  }
}
