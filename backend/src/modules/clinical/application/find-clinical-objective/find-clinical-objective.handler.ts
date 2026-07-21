import type { ClinicalObjectiveRepository } from '../../domain/repositories/clinical-objective-repository.js';
import { toClinicalObjectiveResult } from '../clinical-objective-result.js';
import { executeClinicalObjectiveUseCase } from '../execute-clinical-objective-use-case.js';
import { loadTenantScopedClinicalObjective } from '../load-tenant-scoped-clinical-objective.js';
import { FindClinicalObjectiveQuery } from './find-clinical-objective.query.js';

export class FindClinicalObjectiveHandler {
  constructor(
    private readonly clinicalObjectiveRepository: ClinicalObjectiveRepository,
  ) {}

  async execute(query: FindClinicalObjectiveQuery) {
    return executeClinicalObjectiveUseCase(async () => {
      const objective = await loadTenantScopedClinicalObjective(
        this.clinicalObjectiveRepository,
        query.request.tenantId,
        query.request.clinicalObjectiveId,
      );

      return toClinicalObjectiveResult(objective);
    });
  }
}
