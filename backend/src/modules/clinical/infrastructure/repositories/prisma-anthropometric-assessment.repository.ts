import type { PrismaClient } from '@prisma/client';
import type { AnthropometricAssessmentRepository } from '../../domain/repositories/anthropometric-assessment-repository.js';
import type { AnthropometricAssessment } from '../../domain/aggregates/anthropometric-assessment.aggregate.js';
import type { AnthropometricAssessmentId } from '../../domain/value-objects/anthropometric-assessment-id.js';
import { toDomain, toPersistence } from '../prisma/prisma-anthropometric-assessment.mapper.js';

const LIST_ORDER = [
  { measuredAt: 'desc' as const },
  { createdAt: 'desc' as const },
  { id: 'asc' as const },
];

export class PrismaAnthropometricAssessmentRepository
  implements AnthropometricAssessmentRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async save(assessment: AnthropometricAssessment): Promise<void> {
    const data = toPersistence(assessment);

    await this.prisma.anthropometricAssessment.create({
      data,
    });
  }

  async findByTenantAndId(
    tenantId: string,
    assessmentId: AnthropometricAssessmentId,
  ): Promise<AnthropometricAssessment | null> {
    const record = await this.prisma.anthropometricAssessment.findFirst({
      where: {
        id: assessmentId.toString(),
        tenantId,
      },
    });

    return record ? toDomain(record) : null;
  }

  async findByAnamnesis(
    tenantId: string,
    anamnesisId: string,
  ): Promise<AnthropometricAssessment[]> {
    const records = await this.prisma.anthropometricAssessment.findMany({
      where: { tenantId, anamnesisId },
      orderBy: LIST_ORDER,
    });

    return records.map(toDomain);
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
    dateRange?: { from?: Date; to?: Date },
  ): Promise<AnthropometricAssessment[]> {
    const records = await this.prisma.anthropometricAssessment.findMany({
      where: {
        tenantId,
        patientId,
        measuredAt: {
          ...(dateRange?.from ? { gte: dateRange.from } : {}),
          ...(dateRange?.to ? { lte: dateRange.to } : {}),
        },
      },
      orderBy: LIST_ORDER,
    });

    return records.map(toDomain);
  }

  async existsBySourceRequestId(
    tenantId: string,
    sourceRequestId: string,
  ): Promise<boolean> {
    const count = await this.prisma.anthropometricAssessment.count({
      where: {
        tenantId,
        sourceRequestId,
      },
    });

    return count > 0;
  }
}
