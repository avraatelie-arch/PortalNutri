import type { ClinicalEvolutionRepository } from '../../domain/repositories/clinical-evolution-repository.js';
import {
  toClinicalEvolutionResult,
  type ClinicalEvolutionResult,
} from '../clinical-evolution-result.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { loadTenantScopedClinicalEvolution } from '../load-tenant-scoped-clinical-evolution.js';
import { FindPreviousFinalizedClinicalEvolutionQuery } from './find-previous-finalized-clinical-evolution.query.js';

export class FindPreviousFinalizedClinicalEvolutionHandler {
  constructor(private readonly clinicalEvolutionRepository: ClinicalEvolutionRepository) {}

  async execute(
    query: FindPreviousFinalizedClinicalEvolutionQuery,
  ): Promise<ClinicalEvolutionResult | null> {
    return executeClinicalUseCase(async () => {
      const { tenantId, clinicalEvolutionId } = query.request;

      const current = await loadTenantScopedClinicalEvolution(
        this.clinicalEvolutionRepository,
        tenantId,
        clinicalEvolutionId,
      );

      const previous = await this.clinicalEvolutionRepository.findPreviousFinalized(
        tenantId,
        current.getPatientId(),
        current.getClinicalMomentAt(),
        current.getClinicalEncounterId(),
        current.getId(),
      );

      return previous ? toClinicalEvolutionResult(previous) : null;
    });
  }
}
