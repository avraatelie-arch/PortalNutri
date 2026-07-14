import type { RoleAssignment as RoleAssignmentRecord } from '@prisma/client';
import { RoleAssignmentStatus as PrismaRoleAssignmentStatus } from '@prisma/client';
import { RoleAssignment } from '../../domain/aggregates/role-assignment.aggregate.js';
import { MembershipId } from '../../domain/value-objects/membership-id.js';
import { RoleAssignmentId } from '../../domain/value-objects/role-assignment-id.js';
import { RoleAssignmentStatus } from '../../domain/value-objects/role-assignment-status.js';
import { RoleId } from '../../domain/value-objects/role-id.js';

export type RoleAssignmentPersistenceInput = {
  id: string;
  membershipId: string;
  roleId: string;
  status: PrismaRoleAssignmentStatus;
  createdAt: Date;
  reactivatedAt: Date | null;
  removedAt: Date | null;
};

export function toPersistence(
  assignment: RoleAssignment,
): RoleAssignmentPersistenceInput {
  return {
    id: assignment.getId().toString(),
    membershipId: assignment.getMembershipId().toString(),
    roleId: assignment.getRoleId().toString(),
    status: toPrismaStatus(assignment.getStatus()),
    createdAt: assignment.getCreatedAt(),
    reactivatedAt: assignment.getReactivatedAt(),
    removedAt: assignment.getRemovedAt(),
  };
}

export function toDomain(record: RoleAssignmentRecord): RoleAssignment {
  return RoleAssignment.reconstitute({
    id: RoleAssignmentId.create(record.id),
    membershipId: MembershipId.create(record.membershipId),
    roleId: RoleId.create(record.roleId),
    status: toDomainStatus(record.status),
    createdAt: record.createdAt,
    reactivatedAt: record.reactivatedAt,
    removedAt: record.removedAt,
  });
}

function toPrismaStatus(
  status: RoleAssignmentStatus,
): PrismaRoleAssignmentStatus {
  return status as PrismaRoleAssignmentStatus;
}

function toDomainStatus(
  status: PrismaRoleAssignmentStatus,
): RoleAssignmentStatus {
  return status as RoleAssignmentStatus;
}
