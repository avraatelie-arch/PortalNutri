import type { PermissionAssignment } from '../../domain/aggregates/permission-assignment.aggregate.js';
import type { PermissionAssignmentStatus } from '../../domain/value-objects/permission-assignment-status.js';

export type GrantPermissionOperation = 'CREATED' | 'REACTIVATED';

export interface GrantPermissionResponse {
  id: string;
  roleId: string;
  permissionId: string;
  status: PermissionAssignmentStatus;
  createdAt: string;
  reactivatedAt: string | null;
  removedAt: string | null;
  operation: GrantPermissionOperation;
}

export function toGrantPermissionResponse(
  assignment: PermissionAssignment,
  operation: GrantPermissionOperation,
): GrantPermissionResponse {
  return {
    id: assignment.getId().toString(),
    roleId: assignment.getRoleId().toString(),
    permissionId: assignment.getPermissionId().toString(),
    status: assignment.getStatus(),
    createdAt: assignment.getCreatedAt().toISOString(),
    reactivatedAt: assignment.getReactivatedAt()?.toISOString() ?? null,
    removedAt: assignment.getRemovedAt()?.toISOString() ?? null,
    operation,
  };
}
