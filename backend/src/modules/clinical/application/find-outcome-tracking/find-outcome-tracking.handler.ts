import type { OutcomeTrackingRepository } from '../../domain/repositories/outcome-tracking-repository.js';
import { executeOutcomeTrackingUseCase } from '../execute-outcome-tracking-use-case.js';
import { loadTenantScopedOutcomeTracking } from '../load-tenant-scoped-outcome-tracking.js';
import { toOutcomeTrackingResult } from '../outcome-tracking-result.js';
import { FindOutcomeTrackingQuery } from './find-outcome-tracking.query.js';

export class FindOutcomeTrackingHandler {
  constructor(private readonly outcomeTrackingRepository: OutcomeTrackingRepository) {}

  async execute(query: FindOutcomeTrackingQuery) {
    return executeOutcomeTrackingUseCase(async () => {
      const tracking = await loadTenantScopedOutcomeTracking(
        this.outcomeTrackingRepository,
        query.request.tenantId,
        query.request.outcomeTrackingId,
      );

      return toOutcomeTrackingResult(tracking);
    });
  }
}
