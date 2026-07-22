import type { OutcomeTrackingRepository } from '../../domain/repositories/outcome-tracking-repository.js';
import {
  toOutcomeTrackingResult,
  type OutcomeTrackingResult,
} from '../outcome-tracking-result.js';
import { executeOutcomeTrackingUseCase } from '../execute-outcome-tracking-use-case.js';
import { FindOutcomeTrackingsByClinicalObjectiveQuery } from './find-outcome-trackings-by-clinical-objective.query.js';

export class FindOutcomeTrackingsByClinicalObjectiveHandler {
  constructor(private readonly outcomeTrackingRepository: OutcomeTrackingRepository) {}

  async execute(
    query: FindOutcomeTrackingsByClinicalObjectiveQuery,
  ): Promise<OutcomeTrackingResult[]> {
    return executeOutcomeTrackingUseCase(async () => {
      const { tenantId, clinicalObjectiveId, statuses } = query.request;

      const trackings = await this.outcomeTrackingRepository.findByClinicalObjective(
        tenantId,
        clinicalObjectiveId,
        statuses,
      );

      return trackings.map(toOutcomeTrackingResult);
    });
  }
}
