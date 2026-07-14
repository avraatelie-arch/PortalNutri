import type { PermissionAssignment as PermissionAssignmentRecord } from '@prisma/client';
import { PermissionAssignmentStatus as PrismaPermissionAssignmentStatus } from '@prisma/client';
import { PermissionAssignment } from '../../domain/aggregates/permission-assignment.aggregate.js';
import { PermissionAssignmentId } from '../../domain/value-objects/permission-assignment-id.js';
import { PermissionAssignmentStatus } from '../../domain/value-objects/permission-assignment-status.js';
import { PermissionId } from '../../domain/value-objects/permission-id.js';
import { RoleId } from '../../domain/value-objects/role-id.js';

export type PermissionAssignmentPersistenceInput = {
  id: string;
  roleId: string;
  permissionId: string;
  status: PrismaPermissionAssignmentStatus;
  createdAt: Date;
  reactivatedAt: Date | null;
  removedAt: Date | null;
};

export function toPersistence(
  assignment: PermissionAssignment,
): PermissionAssignmentPersistenceInput {
  return {
    id: assignment.getId().toString(),
    roleId: assignment.getRoleId().toString(),
    permissionId: assignment.getPermissionId().toString(),
    status: toPrismaStatus(assignment.getStatus()),
    createdAt: assignment.getCreatedAt(),
    reactivatedAt: assignment.getReactivatedAt(),
    removedAt: assignment.getRemovedAt(),
  };
}

export function toDomain(
  record: PermissionAssignmentRecord,
): PermissionAssignment {
  return PermissionAssignment.reconstitute({
    id: PermissionAssignmentId.create(record.id),
    roleId: RoleId.create(record.roleId),
    permissionId: PermissionId.create(record.permissionId),
    status: toDomainStatus(record.status),
    createdAt: record.createdAt,
    reactivatedAt: record.reactivatedAt,
    removedAt: record.removedAt,
  });
}

function toPrismaStatus(
  status: PermissionAssignmentStatus,
): PrismaPermissionAssignmentStatus {
  return status as PrismaPermissionAssignmentStatus;
}

function toDomainStatus(
  status: PrismaPermissionAssignmentStatus,
): PermissionAssignmentStatus {
  return status as PermissionAssignmentStatus;
}
