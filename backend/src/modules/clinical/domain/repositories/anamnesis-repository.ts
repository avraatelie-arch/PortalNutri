import type { Anamnesis } from '../aggregates/anamnesis.aggregate.js';
import type { AnamnesisId } from '../value-objects/anamnesis-id.js';

export interface AnamnesisRepository {
  save(anamnesis: Anamnesis): Promise<void>;
  findByTenantAndId(
    tenantId: string,
    id: AnamnesisId,
  ): Promise<Anamnesis | null>;
  existsByClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<boolean>;
  findByClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<Anamnesis | null>;
  findByPatient(tenantId: string, patientId: string): Promise<Anamnesis[]>;
  findByNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<Anamnesis[]>;
}
