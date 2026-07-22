import type { OutcomeTrackingRepository } from '../../domain/repositories/outcome-tracking-repository.js';
import { OutcomeTrackingStatusValue } from '../../domain/value-objects/outcome-tracking-status.js';
import {
  toOutcomeTrackingResult,
  type OutcomeTrackingResult,
} from '../outcome-tracking-result.js';
import { executeOutcomeTrackingUseCase } from '../execute-outcome-tracking-use-case.js';
import { loadTenantScopedOutcomeTracking } from '../load-tenant-scoped-outcome-tracking.js';
import { FindPreviousRecordedOutcomeTrackingByClinicalObjectiveQuery } from './find-previous-recorded-outcome-tracking-by-clinical-objective.query.js';

export class FindPreviousRecordedOutcomeTrackingByClinicalObjectiveHandler {
  constructor(private readonly outcomeTrackingRepository: OutcomeTrackingRepository) {}

  async execute(
    query: FindPreviousRecordedOutcomeTrackingByClinicalObjectiveQuery,
  ): Promise<OutcomeTrackingResult | null> {
    return executeOutcomeTrackingUseCase(async () => {
      const { tenantId, outcomeTrackingId } = query.request;

      const current = await loadTenantScopedOutcomeTracking(
        this.outcomeTrackingRepository,
        tenantId,
        outcomeTrackingId,
      );

      if (current.getStatus() !== OutcomeTrackingStatusValue.Recorded) {
        return null;
      }

      const evaluatedAt = current.getEvaluatedAt();

      if (!evaluatedAt) {
        return null;
      }

      const previous =
        await this.outcomeTrackingRepository.findPreviousRecordedByClinicalObjective(
          tenantId,
          current.getClinicalObjectiveId(),
          evaluatedAt,
          current.getId(),
        );

      return previous ? toOutcomeTrackingResult(previous) : null;
    });
  }
}
