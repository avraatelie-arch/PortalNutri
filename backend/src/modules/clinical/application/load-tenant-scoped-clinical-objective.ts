import type { ClinicalObjective } from '../domain/aggregates/clinical-objective.aggregate.js';
import type { ClinicalObjectiveRepository } from '../domain/repositories/clinical-objective-repository.js';
import { ClinicalObjectiveId } from '../domain/value-objects/clinical-objective-id.js';
import { ClinicalObjectiveNotFoundError } from './errors/clinical-objective-not-found.error.js';

export async function loadTenantScopedClinicalObjective(
  repository: ClinicalObjectiveRepository,
  tenantId: string,
  clinicalObjectiveId: string,
): Promise<ClinicalObjective> {
  const objective = await repository.findByTenantAndId(
    tenantId,
    ClinicalObjectiveId.create(clinicalObjectiveId),
  );

  if (!objective) {
    throw new ClinicalObjectiveNotFoundError(tenantId, clinicalObjectiveId);
  }

  return objective;
}
