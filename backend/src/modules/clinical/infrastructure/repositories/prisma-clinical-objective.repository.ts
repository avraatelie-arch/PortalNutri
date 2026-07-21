import type { PrismaClient } from '@prisma/client';
import type { ClinicalObjective } from '../../domain/aggregates/clinical-objective.aggregate.js';
import type { ClinicalObjectiveRepository } from '../../domain/repositories/clinical-objective-repository.js';
import type { ClinicalObjectiveId } from '../../domain/value-objects/clinical-objective-id.js';
import {
  ClinicalObjectiveStatusValue,
  type ClinicalObjectiveStatus,
} from '../../domain/value-objects/clinical-objective-status.js';
import { toDomain, toPersistence } from '../prisma/prisma-clinical-objective.mapper.js';
import { sortClinicalObjectivesByPriority } from './clinical-objective-sort.js';

export class PrismaClinicalObjectiveRepository implements ClinicalObjectiveRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(objective: ClinicalObjective): Promise<void> {
    const data = toPersistence(objective);

    await this.prisma.clinicalObjective.upsert({
      where: { id: data.id },
      create: data,
      update: {
        responsibleNutritionistId: data.responsibleNutritionistId,
        status: data.status,
        priority: data.priority,
        title: data.title,
        clinicalRationale: data.clinicalRationale,
        successCriteria: data.successCriteria,
        targetDate: data.targetDate,
        activatedAt: data.activatedAt,
        pausedAt: data.pausedAt,
        completedAt: data.completedAt,
        cancelledAt: data.cancelledAt,
        version: data.version,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findByTenantAndId(
    tenantId: string,
    id: ClinicalObjectiveId,
  ): Promise<ClinicalObjective | null> {
    const record = await this.prisma.clinicalObjective.findFirst({
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
    statuses?: ClinicalObjectiveStatus[],
  ): Promise<ClinicalObjective[]> {
    const records = await this.prisma.clinicalObjective.findMany({
      where: {
        tenantId,
        patientId,
        ...(statuses && statuses.length > 0 ? { status: { in: statuses } } : {}),
      },
    });

    return sortClinicalObjectivesByPriority(records.map(toDomain));
  }

  async findActiveByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<ClinicalObjective[]> {
    return this.findByPatient(tenantId, patientId, [
      ClinicalObjectiveStatusValue.Active,
    ]);
  }

  async findByResponsibleNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<ClinicalObjective[]> {
    const records = await this.prisma.clinicalObjective.findMany({
      where: { tenantId, responsibleNutritionistId: nutritionistId },
    });

    return sortClinicalObjectivesByPriority(records.map(toDomain));
  }

  async findByOriginClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<ClinicalObjective[]> {
    const records = await this.prisma.clinicalObjective.findMany({
      where: { tenantId, originClinicalEncounterId: clinicalEncounterId },
    });

    return sortClinicalObjectivesByPriority(records.map(toDomain));
  }

  async findByStatus(
    tenantId: string,
    status: ClinicalObjectiveStatus,
  ): Promise<ClinicalObjective[]> {
    const records = await this.prisma.clinicalObjective.findMany({
      where: { tenantId, status },
    });

    return sortClinicalObjectivesByPriority(records.map(toDomain));
  }
}
