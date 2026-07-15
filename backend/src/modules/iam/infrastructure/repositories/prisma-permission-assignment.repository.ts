import type { PrismaClient } from '@prisma/client';
import type { PermissionAssignmentRepository } from '../../domain/repositories/permission-assignment-repository.js';
import type { PermissionAssignment } from '../../domain/aggregates/permission-assignment.aggregate.js';
import type { PermissionAssignmentId } from '../../domain/value-objects/permission-assignment-id.js';
import type { PermissionId } from '../../domain/value-objects/permission-id.js';
import type { RoleId } from '../../domain/value-objects/role-id.js';
import {
  toDomain,
  toPersistence,
} from '../prisma/prisma-permission-assignment.mapper.js';

export class PrismaPermissionAssignmentRepository
  implements PermissionAssignmentRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async save(assignment: PermissionAssignment): Promise<void> {
    const data = toPersistence(assignment);

    await this.prisma.permissionAssignment.upsert({
      where: { id: data.id },
      create: data,
      update: {
        status: data.status,
        reactivatedAt: data.reactivatedAt,
        removedAt: data.removedAt,
      },
    });
  }

  async findById(
    id: PermissionAssignmentId,
  ): Promise<PermissionAssignment | null> {
    const record = await this.prisma.permissionAssignment.findUnique({
      where: { id: id.toString() },
    });

    return record ? toDomain(record) : null;
  }

  async findByRoleAndPermission(
    roleId: RoleId,
    permissionId: PermissionId,
  ): Promise<PermissionAssignment | null> {
    const record = await this.prisma.permissionAssignment.findUnique({
      where: {
        roleId_permissionId: {
          roleId: roleId.toString(),
          permissionId: permissionId.toString(),
        },
      },
    });

    return record ? toDomain(record) : null;
  }

  async findActiveByRoleId(
    roleId: RoleId,
  ): Promise<PermissionAssignment[]> {
    const records = await this.prisma.permissionAssignment.findMany({
      where: {
        roleId: roleId.toString(),
        status: 'ACTIVE',
      },
    });

    return records.map(toDomain);
  }
}
