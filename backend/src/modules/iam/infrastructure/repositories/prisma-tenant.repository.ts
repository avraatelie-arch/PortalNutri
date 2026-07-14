import type { PrismaClient } from '@prisma/client';
import type { TenantRepository } from '../../domain/repositories/tenant-repository.js';
import type { Tenant } from '../../domain/aggregates/tenant.aggregate.js';
import type { TenantId } from '../../domain/value-objects/tenant-id.js';
import type { TenantSlug } from '../../domain/value-objects/tenant-slug.js';
import { toDomain, toPersistence } from '../prisma/prisma-tenant.mapper.js';

export class PrismaTenantRepository implements TenantRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(tenant: Tenant): Promise<void> {
    const data = toPersistence(tenant);

    await this.prisma.tenant.upsert({
      where: { id: data.id },
      create: data,
      update: {
        name: data.name,
        slug: data.slug,
        status: data.status,
        updatedAt: data.updatedAt,
      },
    });
  }

  async findById(id: TenantId): Promise<Tenant | null> {
    const record = await this.prisma.tenant.findUnique({
      where: { id: id.toString() },
    });

    return record ? toDomain(record) : null;
  }

  async existsBySlug(slug: TenantSlug): Promise<boolean> {
    const record = await this.prisma.tenant.findUnique({
      where: { slug: slug.toString() },
      select: { id: true },
    });

    return record !== null;
  }
}
