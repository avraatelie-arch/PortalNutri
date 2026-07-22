import type { PrismaClient } from '@prisma/client';
import { OutcomeTrackingStatus as PrismaOutcomeTrackingStatus } from '@prisma/client';
import type { OutcomeTrackingRepository } from '../../domain/repositories/outcome-tracking-repository.js';
import type { OutcomeTracking } from '../../domain/aggregates/outcome-tracking.aggregate.js';
import type { OutcomeTrackingId } from '../../domain/value-objects/outcome-tracking-id.js';
import { OutcomeTrackingStatusValue } from '../../domain/value-objects/outcome-tracking-status.js';
import type { OutcomeTrackingStatus } from '../../domain/value-objects/outcome-tracking-status.js';
import { toDomain, toPersistence } from '../prisma/prisma-outcome-tracking.mapper.js';
import {
  findLatestRecordedByChronology,
  findPreviousRecordedBeforeChronology,
  sortOutcomeTrackingsByChronology,
} from './outcome-tracking-chronology.js';

export class PrismaOutcomeTrackingRepository implements OutcomeTrackingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(tracking: OutcomeTracking): Promise<void> {
    const data = toPersistence(tracking);

    await this.prisma.outcomeTracking.upsert({
      where: { id: data.id },
      create: data,
      update: {
        responsibleNutritionistId: data.responsibleNutritionistId,
        status: data.status,
        version: data.version,
        outcomeAssessment: data.outcomeAssessment,
        adherenceFactor: data.adherenceFactor,
        professionalRationale: data.professionalRationale,
        clinicalNotes: data.clinicalNotes,
        evaluatedAt: data.evaluatedAt,
        recordedAt: data.recordedAt,
        cancelledAt: data.cancelledAt,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findByTenantAndId(
    tenantId: string,
    id: OutcomeTrackingId,
  ): Promise<OutcomeTracking | null> {
    const record = await this.prisma.outcomeTracking.findFirst({
      where: {
        id: id.toString(),
        tenantId,
      },
    });

    return record ? toDomain(record) : null;
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: OutcomeTrackingStatus[],
    clinicalObjectiveId?: string,
  ): Promise<OutcomeTracking[]> {
    const records = await this.prisma.outcomeTracking.findMany({
      where: {
        tenantId,
        patientId,
        ...(clinicalObjectiveId ? { clinicalObjectiveId } : {}),
        ...(statuses
          ? { status: { in: statuses as PrismaOutcomeTrackingStatus[] } }
          : {}),
      },
    });

    return sortOutcomeTrackingsByChronology(records.map(toDomain));
  }

  async findByClinicalObjective(
    tenantId: string,
    clinicalObjectiveId: string,
    statuses?: OutcomeTrackingStatus[],
  ): Promise<OutcomeTracking[]> {
    const records = await this.prisma.outcomeTracking.findMany({
      where: {
        tenantId,
        clinicalObjectiveId,
        ...(statuses
          ? { status: { in: statuses as PrismaOutcomeTrackingStatus[] } }
          : {}),
      },
    });

    return sortOutcomeTrackingsByChronology(records.map(toDomain));
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
