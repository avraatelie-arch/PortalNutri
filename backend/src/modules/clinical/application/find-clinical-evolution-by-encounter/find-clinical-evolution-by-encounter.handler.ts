import type { ClinicalEvolutionRepository } from '../../domain/repositories/clinical-evolution-repository.js';
import { toClinicalEvolutionResult } from '../clinical-evolution-result.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { ClinicalEvolutionNotFoundError } from '../errors/clinical-evolution-not-found.error.js';
import { FindClinicalEvolutionByEncounterQuery } from './find-clinical-evolution-by-encounter.query.js';

export class FindClinicalEvolutionByEncounterHandler {
  constructor(private readonly clinicalEvolutionRepository: ClinicalEvolutionRepository) {}

  async execute(query: FindClinicalEvolutionByEncounterQuery) {
    return executeClinicalUseCase(async () => {
      const { tenantId, clinicalEncounterId } = query.request;

      const evolution = await this.clinicalEvolutionRepository.findByClinicalEncounter(
        tenantId,
        clinicalEncounterId,
      );

      if (!evolution) {
        throw new ClinicalEvolutionNotFoundError(tenantId, clinicalEncounterId);
      }

      return toClinicalEvolutionResult(evolution);
    });
  }
}
