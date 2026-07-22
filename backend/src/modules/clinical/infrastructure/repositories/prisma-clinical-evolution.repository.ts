import type { PrismaClient } from '@prisma/client';
import { ClinicalEvolutionStatus as PrismaClinicalEvolutionStatus } from '@prisma/client';
import type { ClinicalEvolutionRepository } from '../../domain/repositories/clinical-evolution-repository.js';
import type { ClinicalEvolution } from '../../domain/aggregates/clinical-evolution.aggregate.js';
import type { ClinicalEvolutionId } from '../../domain/value-objects/clinical-evolution-id.js';
import { ClinicalEvolutionStatusValue } from '../../domain/value-objects/clinical-evolution-status.js';
import type { ClinicalEvolutionStatus } from '../../domain/value-objects/clinical-evolution-status.js';
import { toDomain, toPersistence } from '../prisma/prisma-clinical-evolution.mapper.js';
import {
  findLatestFinalizedByChronology,
  findPreviousFinalizedBeforeChronology,
  sortClinicalEvolutionsByChronology,
} from './clinical-evolution-chronology.js';

export class PrismaClinicalEvolutionRepository implements ClinicalEvolutionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(evolution: ClinicalEvolution): Promise<void> {
    const data = toPersistence(evolution);

    await this.prisma.clinicalEvolution.upsert({
      where: { id: data.id },
      create: data,
      update: {
        responsibleNutritionistId: data.responsibleNutritionistId,
        status: data.status,
        version: data.version,
        subjectiveEvolution: data.subjectiveEvolution,
        professionalObservations: data.professionalObservations,
        treatmentResponse: data.treatmentResponse,
        adherenceAndBarriers: data.adherenceAndBarriers,
        adverseEventsNotes: data.adverseEventsNotes,
        nextClinicalConsiderations: data.nextClinicalConsiderations,
        finalizedAt: data.finalizedAt,
        cancelledAt: data.cancelledAt,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findByTenantAndId(
    tenantId: string,
    id: ClinicalEvolutionId,
  ): Promise<ClinicalEvolution | null> {
    const record = await this.prisma.clinicalEvolution.findFirst({
      where: {
        id: id.toString(),
        tenantId,
      },
    });

    return record ? toDomain(record) : null;
  }

  async existsByClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<boolean> {
    const count = await this.prisma.clinicalEvolution.count({
      where: {
        tenantId,
        clinicalEncounterId,
      },
    });

    return count > 0;
  }

  async findByClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<ClinicalEvolution | null> {
    const record = await this.prisma.clinicalEvolution.findFirst({
      where: {
        tenantId,
        clinicalEncounterId,
      },
    });

    return record ? toDomain(record) : null;
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: ClinicalEvolutionStatus[],
  ): Promise<ClinicalEvolution[]> {
    const records = await this.prisma.clinicalEvolution.findMany({
      where: {
        tenantId,
        patientId,
        ...(statuses
          ? { status: { in: statuses as PrismaClinicalEvolutionStatus[] } }
          : {}),
      },
    });

    return sortClinicalEvolutionsByChronology(records.map(toDomain));
  }

  async findLatestFinalizedByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<ClinicalEvolution | null> {
    const finalized = await this.findByPatient(tenantId, patientId, [
      ClinicalEvolutionStatusValue.Finalized,
    ]);

    return findLatestFinalizedByChronology(finalized);
  }

  async findPreviousFinalized(
    tenantId: string,
    patientId: string,
    currentClinicalMomentAt: Date,
    currentClinicalEncounterId: string,
    excludeEvolutionId?: ClinicalEvolutionId,
  ): Promise<ClinicalEvolution | null> {
    const finalized = await this.findByPatient(tenantId, patientId, [
      ClinicalEvolutionStatusValue.Finalized,
    ]);

    return findPreviousFinalizedBeforeChronology(
      finalized,
      currentClinicalMomentAt,
      currentClinicalEncounterId,
      excludeEvolutionId?.toString(),
    );
  }
}
