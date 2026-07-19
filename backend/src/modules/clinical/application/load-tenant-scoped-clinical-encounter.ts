import type { ClinicalEncounter } from '../domain/aggregates/clinical-encounter.aggregate.js';
import type { ClinicalEncounterRepository } from '../domain/repositories/clinical-encounter-repository.js';
import { ClinicalEncounterId } from '../domain/value-objects/clinical-encounter-id.js';
import { ClinicalEncounterNotFoundError } from './errors/clinical-encounter-not-found.error.js';

export async function loadTenantScopedClinicalEncounter(
  repository: ClinicalEncounterRepository,
  tenantId: string,
  encounterId: string,
): Promise<ClinicalEncounter> {
  const encounter = await repository.findByTenantAndId(
    tenantId,
    ClinicalEncounterId.create(encounterId),
  );

  if (!encounter) {
    throw new ClinicalEncounterNotFoundError(tenantId, encounterId);
  }

  return encounter;
}
