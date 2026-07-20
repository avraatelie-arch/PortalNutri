import type { AnamnesisRepository } from '../../domain/repositories/anamnesis-repository.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { toAnamnesisResult } from '../anamnesis-result.js';
import { AnamnesisNotFoundError } from '../errors/anamnesis-not-found.error.js';
import { FindAnamnesisByClinicalEncounterQuery } from './find-anamnesis-by-clinical-encounter.query.js';

export class FindAnamnesisByClinicalEncounterHandler {
  constructor(private readonly anamnesisRepository: AnamnesisRepository) {}

  async execute(query: FindAnamnesisByClinicalEncounterQuery) {
    return executeClinicalUseCase(async () => {
      const { tenantId, clinicalEncounterId } = query.request;

      const anamnesis = await this.anamnesisRepository.findByClinicalEncounter(
        tenantId,
        clinicalEncounterId,
      );

      if (!anamnesis) {
        throw new AnamnesisNotFoundError(tenantId, clinicalEncounterId);
      }

      return toAnamnesisResult(anamnesis);
    });
  }
}
