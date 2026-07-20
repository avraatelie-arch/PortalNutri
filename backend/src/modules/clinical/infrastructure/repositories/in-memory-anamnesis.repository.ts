import type { AnamnesisRepository } from '../../domain/repositories/anamnesis-repository.js';
import type { Anamnesis } from '../../domain/aggregates/anamnesis.aggregate.js';
import type { AnamnesisId } from '../../domain/value-objects/anamnesis-id.js';

export class InMemoryAnamnesisRepository implements AnamnesisRepository {
  private readonly anamneses = new Map<string, Anamnesis>();

  async save(anamnesis: Anamnesis): Promise<void> {
    this.anamneses.set(anamnesis.getId().toString(), anamnesis);
  }

  async findByTenantAndId(
    tenantId: string,
    id: AnamnesisId,
  ): Promise<Anamnesis | null> {
    const anamnesis = this.anamneses.get(id.toString());

    if (!anamnesis || anamnesis.getTenantId() !== tenantId) {
      return null;
    }

    return anamnesis;
  }

  async existsByClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<boolean> {
    for (const anamnesis of this.anamneses.values()) {
      if (
        anamnesis.getTenantId() === tenantId &&
        anamnesis.getClinicalEncounterId() === clinicalEncounterId
      ) {
        return true;
      }
    }

    return false;
  }

  async findByClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<Anamnesis | null> {
    for (const anamnesis of this.anamneses.values()) {
      if (
        anamnesis.getTenantId() === tenantId &&
        anamnesis.getClinicalEncounterId() === clinicalEncounterId
      ) {
        return anamnesis;
      }
    }

    return null;
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<Anamnesis[]> {
    return [...this.anamneses.values()].filter(
      (anamnesis) =>
        anamnesis.getTenantId() === tenantId &&
        anamnesis.getPatientId() === patientId,
    );
  }

  async findByNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<Anamnesis[]> {
    return [...this.anamneses.values()].filter(
      (anamnesis) =>
        anamnesis.getTenantId() === tenantId &&
        anamnesis.getNutritionistId() === nutritionistId,
    );
  }
}
