import type { OutcomeTrackingRepository } from '../../domain/repositories/outcome-tracking-repository.js';
import type { OutcomeTracking } from '../../domain/aggregates/outcome-tracking.aggregate.js';
import type { OutcomeTrackingId } from '../../domain/value-objects/outcome-tracking-id.js';
import { OutcomeTrackingStatusValue } from '../../domain/value-objects/outcome-tracking-status.js';
import type { OutcomeTrackingStatus } from '../../domain/value-objects/outcome-tracking-status.js';
import {
  findLatestRecordedByChronology,
  findPreviousRecordedBeforeChronology,
  sortOutcomeTrackingsByChronology,
} from './outcome-tracking-chronology.js';

export class InMemoryOutcomeTrackingRepository implements OutcomeTrackingRepository {
  private readonly records = new Map<string, OutcomeTracking>();

  async save(tracking: OutcomeTracking): Promise<void> {
    this.records.set(tracking.getId().toString(), tracking);
  }

  async findByTenantAndId(
    tenantId: string,
    id: OutcomeTrackingId,
  ): Promise<OutcomeTracking | null> {
    const tracking = this.records.get(id.toString());

    if (!tracking || tracking.getTenantId() !== tenantId) {
      return null;
    }

    return tracking;
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: OutcomeTrackingStatus[],
    clinicalObjectiveId?: string,
  ): Promise<OutcomeTracking[]> {
    const matches = [...this.records.values()].filter((tracking) => {
      if (tracking.getTenantId() !== tenantId || tracking.getPatientId() !== patientId) {
        return false;
      }

      if (clinicalObjectiveId && tracking.getClinicalObjectiveId() !== clinicalObjectiveId) {
        return false;
      }

      if (statuses && !statuses.includes(tracking.getStatus())) {
        return false;
      }

      return true;
    });

    return sortOutcomeTrackingsByChronology(matches);
  }

  async findByClinicalObjective(
    tenantId: string,
    clinicalObjectiveId: string,
    statuses?: OutcomeTrackingStatus[],
  ): Promise<OutcomeTracking[]> {
    const matches = [...this.records.values()].filter((tracking) => {
      if (
        tracking.getTenantId() !== tenantId
        || tracking.getClinicalObjectiveId() !== clinicalObjectiveId
      ) {
        return false;
      }

      if (statuses && !statuses.includes(tracking.getStatus())) {
        return false;
      }

      return true;
    });

    return sortOutcomeTrackingsByChronology(matches);
  }

  async findLatestRecordedByClinicalObjective(
    tenantId: string,
    clinicalObjectiveId: string,
  ): Promise<OutcomeTracking | null> {
    const recorded = await this.findByClinicalObjective(tenantId, clinicalObjectiveId, [
      OutcomeTrackingStatusValue.Recorded,
    ]);

    return findLatestRecordedByChronology(recorded);
  }

  async findPreviousRecordedByClinicalObjective(
    tenantId: string,
    clinicalObjectiveId: string,
    currentEvaluatedAt: Date,
    excludeOutcomeTrackingId?: OutcomeTrackingId,
  ): Promise<OutcomeTracking | null> {
    const recorded = await this.findByClinicalObjective(tenantId, clinicalObjectiveId, [
      OutcomeTrackingStatusValue.Recorded,
    ]);

    return findPreviousRecordedBeforeChronology(
      recorded,
      currentEvaluatedAt,
      excludeOutcomeTrackingId?.toString(),
    );
  }
}
