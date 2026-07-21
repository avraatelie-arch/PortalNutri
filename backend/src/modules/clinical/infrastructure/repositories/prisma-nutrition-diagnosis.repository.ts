import type { PrismaClient } from '@prisma/client';
import type { NutritionDiagnosis } from '../../domain/aggregates/nutrition-diagnosis.aggregate.js';
import type { NutritionDiagnosisRepository } from '../../domain/repositories/nutrition-diagnosis-repository.js';
import type { NutritionDiagnosisId } from '../../domain/value-objects/nutrition-diagnosis-id.js';
import {
  NutritionDiagnosisStatusValue,
  type NutritionDiagnosisStatus,
} from '../../domain/value-objects/nutrition-diagnosis-status.js';
import { toDomain, toPersistence } from '../prisma/prisma-nutrition-diagnosis.mapper.js';
import {
  getLatestNutritionDiagnosisByEffectiveDate,
  sortNutritionDiagnosesByEffectiveDate,
} from './nutrition-diagnosis-sort.js';

export class PrismaNutritionDiagnosisRepository implements NutritionDiagnosisRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(diagnosis: NutritionDiagnosis): Promise<void> {
    const data = toPersistence(diagnosis);

    await this.prisma.nutritionDiagnosis.upsert({
      where: { id: data.id },
      create: data,
      update: {
        responsibleNutritionistId: data.responsibleNutritionistId,
        problemCategory: data.problemCategory,
        status: data.status,
        professionalInterpretation: data.professionalInterpretation,
        cancellationReason: data.cancellationReason,
        confirmedAt: data.confirmedAt,
        cancelledAt: data.cancelledAt,
        version: data.version,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findByTenantAndId(
    tenantId: string,
    id: NutritionDiagnosisId,
  ): Promise<NutritionDiagnosis | null> {
    const record = await this.prisma.nutritionDiagnosis.findFirst({
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
    statuses?: NutritionDiagnosisStatus[],
  ): Promise<NutritionDiagnosis[]> {
    const records = await this.prisma.nutritionDiagnosis.findMany({
      where: {
        tenantId,
        patientId,
        ...(statuses && statuses.length > 0 ? { status: { in: statuses } } : {}),
      },
    });

    return sortNutritionDiagnosesByEffectiveDate(records.map(toDomain));
  }

  async findConfirmedByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<NutritionDiagnosis[]> {
    return this.findByPatient(tenantId, patientId, [
      NutritionDiagnosisStatusValue.Confirmed,
    ]);
  }

  async findByResponsibleNutritionist(
    tenantId: string,
    nutritionistId: string,
  ): Promise<NutritionDiagnosis[]> {
    const records = await this.prisma.nutritionDiagnosis.findMany({
      where: { tenantId, responsibleNutritionistId: nutritionistId },
    });

    return sortNutritionDiagnosesByEffectiveDate(records.map(toDomain));
  }

  async findByOriginClinicalEncounter(
    tenantId: string,
    clinicalEncounterId: string,
  ): Promise<NutritionDiagnosis[]> {
    const records = await this.prisma.nutritionDiagnosis.findMany({
      where: { tenantId, originClinicalEncounterId: clinicalEncounterId },
    });

    return sortNutritionDiagnosesByEffectiveDate(records.map(toDomain));
  }

  async findByStatus(
    tenantId: string,
    status: NutritionDiagnosisStatus,
  ): Promise<NutritionDiagnosis[]> {
    const records = await this.prisma.nutritionDiagnosis.findMany({
      where: { tenantId, status },
    });

    return sortNutritionDiagnosesByEffectiveDate(records.map(toDomain));
  }

  async findLatestByPatient(
    tenantId: string,
    patientId: string,
  ): Promise<NutritionDiagnosis | null> {
    const records = await this.prisma.nutritionDiagnosis.findMany({
      where: { tenantId, patientId },
    });

    return getLatestNutritionDiagnosisByEffectiveDate(records.map(toDomain));
  }
}
