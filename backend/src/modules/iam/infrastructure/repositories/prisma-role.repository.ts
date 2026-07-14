import type { PrismaClient } from '@prisma/client';
import type { RoleRepository } from '../../domain/repositories/role-repository.js';
import type { Role } from '../../domain/aggregates/role.aggregate.js';
import type { RoleId } from '../../domain/value-objects/role-id.js';
import type { TenantId } from '../../domain/value-objects/tenant-id.js';
import { toDomain, toPersistence } from '../prisma/prisma-role.mapper.js';

export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(role: Role): Promise<void> {
    const data = toPersistence(role);

    await this.prisma.role.upsert({
      where: { id: data.id },
      create: data,
      update: {
        name: data.name,
        normalizedName: data.normalizedName,
      },
    });
  }

  async findById(id: RoleId): Promise<Role | null> {
    const record = await this.prisma.role.findUnique({
      where: { id: id.toString() },
    });

    return record ? toDomain(record) : null;
  }

  async existsByTenantAndNormalizedName(
    tenantId: TenantId,
    normalizedName: string,
  ): Promise<boolean> {
    const record = await this.prisma.role.findUnique({
      where: {
        tenantId_normalizedName: {
          tenantId: tenantId.toString(),
          normalizedName,
        },
      },
      select: { id: true },
    });

    return record !== null;
  }
}
