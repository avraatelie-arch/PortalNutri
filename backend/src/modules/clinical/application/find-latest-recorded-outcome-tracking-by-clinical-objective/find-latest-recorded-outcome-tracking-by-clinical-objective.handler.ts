import type { OutcomeTrackingRepository } from '../../domain/repositories/outcome-tracking-repository.js';
import {
  toOutcomeTrackingResult,
  type OutcomeTrackingResult,
} from '../outcome-tracking-result.js';
import { executeOutcomeTrackingUseCase } from '../execute-outcome-tracking-use-case.js';
import { FindLatestRecordedOutcomeTrackingByClinicalObjectiveQuery } from './find-latest-recorded-outcome-tracking-by-clinical-objective.query.js';

export class FindLatestRecordedOutcomeTrackingByClinicalObjectiveHandler {
  constructor(private readonly outcomeTrackingRepository: OutcomeTrackingRepository) {}

  async execute(
    query: FindLatestRecordedOutcomeTrackingByClinicalObjectiveQuery,
  ): Promise<OutcomeTrackingResult | null> {
    return executeOutcomeTrackingUseCase(async () => {
      const { tenantId, clinicalObjectiveId } = query.request;

      const tracking =
        await this.outcomeTrackingRepository.findLatestRecordedByClinicalObjective(
          tenantId,
          clinicalObjectiveId,
        );

      return tracking ? toOutcomeTrackingResult(tracking) : null;
    });
  }
}
