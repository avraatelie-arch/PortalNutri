import type { PrismaClient } from '@prisma/client';
import type { PermissionRepository } from '../../domain/repositories/permission-repository.js';
import type { Permission } from '../../domain/aggregates/permission.aggregate.js';
import type { PermissionId } from '../../domain/value-objects/permission-id.js';
import type { TenantId } from '../../domain/value-objects/tenant-id.js';
import {
  toDomain,
  toPersistence,
} from '../prisma/prisma-permission.mapper.js';

export class PrismaPermissionRepository implements PermissionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(permission: Permission): Promise<void> {
    const data = toPersistence(permission);

    await this.prisma.permission.upsert({
      where: { id: data.id },
      create: data,
      update: {
        name: data.name,
        normalizedName: data.normalizedName,
      },
    });
  }

  async findById(id: PermissionId): Promise<Permission | null> {
    const record = await this.prisma.permission.findUnique({
      where: { id: id.toString() },
    });

    return record ? toDomain(record) : null;
  }

  async existsByTenantAndNormalizedName(
    tenantId: TenantId,
    normalizedName: string,
  ): Promise<boolean> {
    const record = await this.prisma.permission.findUnique({
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

  async findByTenantAndNormalizedName(
    tenantId: TenantId,
    normalizedName: string,
  ): Promise<Permission | null> {
    const record = await this.prisma.permission.findUnique({
      where: {
        tenantId_normalizedName: {
          tenantId: tenantId.toString(),
          normalizedName,
        },
      },
    });

    return record ? toDomain(record) : null;
  }
}
