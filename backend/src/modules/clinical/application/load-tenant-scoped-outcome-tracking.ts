import type { OutcomeTracking } from '../domain/aggregates/outcome-tracking.aggregate.js';
import type { OutcomeTrackingRepository } from '../domain/repositories/outcome-tracking-repository.js';
import { OutcomeTrackingId } from '../domain/value-objects/outcome-tracking-id.js';
import { OutcomeTrackingNotFoundError } from './errors/outcome-tracking-not-found.error.js';

export async function loadTenantScopedOutcomeTracking(
  repository: OutcomeTrackingRepository,
  tenantId: string,
  outcomeTrackingId: string,
): Promise<OutcomeTracking> {
  const tracking = await repository.findByTenantAndId(
    tenantId,
    OutcomeTrackingId.create(outcomeTrackingId),
  );

  if (!tracking) {
    throw new OutcomeTrackingNotFoundError(tenantId, outcomeTrackingId);
  }

  return tracking;
}
