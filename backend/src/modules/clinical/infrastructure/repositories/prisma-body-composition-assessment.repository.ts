import type { PrismaClient } from '@prisma/client';
import type { BodyCompositionAssessmentRepository } from '../../domain/repositories/body-composition-assessment-repository.js';
import type { BodyCompositionAssessment } from '../../domain/aggregates/body-composition-assessment.aggregate.js';
import type { BodyCompositionAssessmentId } from '../../domain/value-objects/body-composition-assessment-id.js';
import { toDomain, toPersistence } from '../prisma/prisma-body-composition-assessment.mapper.js';

const LIST_ORDER = [
  { measuredAt: 'desc' as const },
  { createdAt: 'desc' as const },
  { id: 'asc' as const },
];

export class PrismaBodyCompositionAssessmentRepository
  implements BodyCompositionAssessmentRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async save(assessment: BodyCompositionAssessment): Promise<void> {
    const data = toPersistence(assessment);

    await this.prisma.bodyCompositionAssessment.create({
      data,
    });
  }

  async findByTenantAndId(
    tenantId: string,
    assessmentId: BodyCompositionAssessmentId,
  ): Promise<BodyCompositionAssessment | null> {
    const record = await this.prisma.bodyCompositionAssessment.findFirst({
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
  ): Promise<BodyCompositionAssessment[]> {
    const records = await this.prisma.bodyCompositionAssessment.findMany({
      where: { tenantId, anamnesisId },
      orderBy: LIST_ORDER,
    });

    return records.map(toDomain);
  }

  async findByPatient(
    tenantId: string,
    patientId: string,
    dateRange?: { from?: Date; to?: Date },
  ): Promise<BodyCompositionAssessment[]> {
    const records = await this.prisma.bodyCompositionAssessment.findMany({
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
    const count = await this.prisma.bodyCompositionAssessment.count({
      where: {
        tenantId,
        sourceRequestId,
      },
    });

    return count > 0;
  }
}
