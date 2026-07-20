import type { AnamnesisRepository } from '../../domain/repositories/anamnesis-repository.js';
import { executeClinicalUseCase } from '../execute-clinical-use-case.js';
import { loadTenantScopedAnamnesis } from '../load-tenant-scoped-anamnesis.js';
import { toAnamnesisResult } from '../anamnesis-result.js';
import { FindAnamnesisQuery } from './find-anamnesis.query.js';

export class FindAnamnesisHandler {
  constructor(private readonly anamnesisRepository: AnamnesisRepository) {}

  async execute(query: FindAnamnesisQuery) {
    return executeClinicalUseCase(async () => {
      const anamnesis = await loadTenantScopedAnamnesis(
        this.anamnesisRepository,
        query.request.tenantId,
        query.request.anamnesisId,
      );

      return toAnamnesisResult(anamnesis);
    });
  }
}
