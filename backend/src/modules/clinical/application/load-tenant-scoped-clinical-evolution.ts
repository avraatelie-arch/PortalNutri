import type { ClinicalEvolution } from '../domain/aggregates/clinical-evolution.aggregate.js';
import type { ClinicalEvolutionRepository } from '../domain/repositories/clinical-evolution-repository.js';
import { ClinicalEvolutionId } from '../domain/value-objects/clinical-evolution-id.js';
import { ClinicalEvolutionNotFoundError } from './errors/clinical-evolution-not-found.error.js';

export async function loadTenantScopedClinicalEvolution(
  repository: ClinicalEvolutionRepository,
  tenantId: string,
  clinicalEvolutionId: string,
): Promise<ClinicalEvolution> {
  const evolution = await repository.findByTenantAndId(
    tenantId,
    ClinicalEvolutionId.create(clinicalEvolutionId),
  );

  if (!evolution) {
    throw new ClinicalEvolutionNotFoundError(tenantId, clinicalEvolutionId);
  }

  return evolution;
}
