import type { PrismaClient } from '@prisma/client';
import type { RoleAssignmentRepository } from '../../domain/repositories/role-assignment-repository.js';
import type { RoleAssignment } from '../../domain/aggregates/role-assignment.aggregate.js';
import type { MembershipId } from '../../domain/value-objects/membership-id.js';
import type { RoleAssignmentId } from '../../domain/value-objects/role-assignment-id.js';
import type { RoleId } from '../../domain/value-objects/role-id.js';
import {
  toDomain,
  toPersistence,
} from '../prisma/prisma-role-assignment.mapper.js';

export class PrismaRoleAssignmentRepository implements RoleAssignmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(assignment: RoleAssignment): Promise<void> {
    const data = toPersistence(assignment);

    await this.prisma.roleAssignment.upsert({
      where: { id: data.id },
      create: data,
      update: {
        status: data.status,
        reactivatedAt: data.reactivatedAt,
        removedAt: data.removedAt,
      },
    });
  }

  async findById(id: RoleAssignmentId): Promise<RoleAssignment | null> {
    const record = await this.prisma.roleAssignment.findUnique({
      where: { id: id.toString() },
    });

    return record ? toDomain(record) : null;
  }

  async findByMembershipAndRole(
    membershipId: MembershipId,
    roleId: RoleId,
  ): Promise<RoleAssignment | null> {
    const record = await this.prisma.roleAssignment.findUnique({
      where: {
        membershipId_roleId: {
          membershipId: membershipId.toString(),
          roleId: roleId.toString(),
        },
      },
    });

    return record ? toDomain(record) : null;
  }
}
