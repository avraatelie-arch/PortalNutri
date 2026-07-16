import type { PrismaClient } from '@prisma/client';
import type { NutritionistRepository } from '../../domain/repositories/nutritionist-repository.js';
import type { Nutritionist } from '../../domain/aggregates/nutritionist.aggregate.js';
import type { Crn } from '../../domain/value-objects/crn.js';
import type { NutritionistId } from '../../domain/value-objects/nutritionist-id.js';
import type { PersonId } from '../../../iam/domain/value-objects/person-id.js';
import type { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import { toDomain, toPersistence } from '../prisma/prisma-nutritionist.mapper.js';

export class PrismaNutritionistRepository implements NutritionistRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(nutritionist: Nutritionist): Promise<void> {
    const data = toPersistence(nutritionist);

    await this.prisma.nutritionist.upsert({
      where: { id: data.id },
      create: data,
      update: {
        specialty: data.specialty,
        bio: data.bio,
        status: data.status,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findById(id: NutritionistId): Promise<Nutritionist | null> {
    const record = await this.prisma.nutritionist.findUnique({
      where: { id: id.toString() },
    });

    return record ? toDomain(record) : null;
  }

  async findByPersonAndTenant(
    personId: PersonId,
    tenantId: TenantId,
  ): Promise<Nutritionist | null> {
    const record = await this.prisma.nutritionist.findFirst({
      where: {
        personId: personId.toString(),
        tenantId: tenantId.toString(),
      },
    });

    return record ? toDomain(record) : null;
  }

  async existsByCrn(tenantId: TenantId, crn: Crn): Promise<boolean> {
    const record = await this.prisma.nutritionist.findUnique({
      where: {
        tenantId_crn: {
          tenantId: tenantId.toString(),
          crn: crn.toString(),
        },
      },
      select: { id: true },
    });

    return record !== null;
  }
}
