import type { Anamnesis } from '../domain/aggregates/anamnesis.aggregate.js';
import type { AnamnesisRepository } from '../domain/repositories/anamnesis-repository.js';
import { AnamnesisId } from '../domain/value-objects/anamnesis-id.js';
import { AnamnesisNotFoundError } from './errors/anamnesis-not-found.error.js';
import { AnamnesisTenantMismatchError } from './errors/anamnesis-tenant-mismatch.error.js';

export async function loadTenantScopedAnamnesis(
  repository: AnamnesisRepository,
  tenantId: string,
  anamnesisId: string,
): Promise<Anamnesis> {
  const anamnesis = await repository.findByTenantAndId(
    tenantId,
    AnamnesisId.create(anamnesisId),
  );

  if (!anamnesis) {
    throw new AnamnesisNotFoundError(tenantId, anamnesisId);
  }

  if (anamnesis.getTenantId() !== tenantId) {
    throw new AnamnesisTenantMismatchError(tenantId, anamnesisId);
  }

  return anamnesis;
}
