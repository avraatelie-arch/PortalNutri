import type { ClinicalEvolutionRepository } from '../../domain/repositories/clinical-evolution-repository.js';
import { toClinicalEvolutionResult } from '../clinical-evolution-result.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { loadTenantScopedClinicalEvolution } from '../load-tenant-scoped-clinical-evolution.js';
import { FindClinicalEvolutionQuery } from './find-clinical-evolution.query.js';

export class FindClinicalEvolutionHandler {
  constructor(private readonly clinicalEvolutionRepository: ClinicalEvolutionRepository) {}

  async execute(query: FindClinicalEvolutionQuery) {
    return executeClinicalUseCase(async () => {
      const evolution = await loadTenantScopedClinicalEvolution(
        this.clinicalEvolutionRepository,
        query.request.tenantId,
        query.request.clinicalEvolutionId,
      );

      return toClinicalEvolutionResult(evolution);
    });
  }
}
