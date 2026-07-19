import type { ClinicalEncounterRepository } from '../../domain/repositories/clinical-encounter-repository.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { loadTenantScopedClinicalEncounter } from '../load-tenant-scoped-clinical-encounter.js';
import { toClinicalEncounterResult } from '../clinical-encounter-result.js';
import { FindClinicalEncounterQuery } from './find-clinical-encounter.query.js';

export class FindClinicalEncounterHandler {
  constructor(
    private readonly encounterRepository: ClinicalEncounterRepository,
  ) {}

  async execute(query: FindClinicalEncounterQuery) {
    return executeClinicalUseCase(async () => {
      const encounter = await loadTenantScopedClinicalEncounter(
        this.encounterRepository,
        query.request.tenantId,
        query.request.encounterId,
      );

      return toClinicalEncounterResult(encounter);
    });
  }
}
