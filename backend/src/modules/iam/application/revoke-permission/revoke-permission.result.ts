import type { PermissionAssignment } from '../../domain/aggregates/permission-assignment.aggregate.js';
import type { PermissionAssignmentStatus } from '../../domain/value-objects/permission-assignment-status.js';

export interface RevokePermissionResult {
  id: string;
  roleId: string;
  permissionId: string;
  status: PermissionAssignmentStatus;
  createdAt: string;
  reactivatedAt: string | null;
  removedAt: string | null;
}

export function toRevokePermissionResult(
  assignment: PermissionAssignment,
): RevokePermissionResult {
  return {
    id: assignment.getId().toString(),
    roleId: assignment.getRoleId().toString(),
    permissionId: assignment.getPermissionId().toString(),
    status: assignment.getStatus(),
    createdAt: assignment.getCreatedAt().toISOString(),
    reactivatedAt: assignment.getReactivatedAt()?.toISOString() ?? null,
    removedAt: assignment.getRemovedAt()?.toISOString() ?? null,
  };
}
