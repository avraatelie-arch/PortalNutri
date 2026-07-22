import type { OutcomeTracking } from '../aggregates/outcome-tracking.aggregate.js';
import type { OutcomeTrackingId } from '../value-objects/outcome-tracking-id.js';
import type { OutcomeTrackingStatus } from '../value-objects/outcome-tracking-status.js';

export interface OutcomeTrackingRepository {
  save(tracking: OutcomeTracking): Promise<void>;
  findByTenantAndId(
    tenantId: string,
    id: OutcomeTrackingId,
  ): Promise<OutcomeTracking | null>;
  findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: OutcomeTrackingStatus[],
    clinicalObjectiveId?: string,
  ): Promise<OutcomeTracking[]>;
  findByClinicalObjective(
    tenantId: string,
    clinicalObjectiveId: string,
    statuses?: OutcomeTrackingStatus[],
  ): Promise<OutcomeTracking[]>;
  findLatestRecordedByClinicalObjective(
    tenantId: string,
    clinicalObjectiveId: string,
  ): Promise<OutcomeTracking | null>;
  findPreviousRecordedByClinicalObjective(
    tenantId: string,
    clinicalObjectiveId: string,
    currentEvaluatedAt: Date,
    excludeOutcomeTrackingId?: OutcomeTrackingId,
  ): Promise<OutcomeTracking | null>;
}
