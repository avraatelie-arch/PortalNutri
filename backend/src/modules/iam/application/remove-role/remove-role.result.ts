import type { RoleAssignment } from '../../domain/aggregates/role-assignment.aggregate.js';
import type { RoleAssignmentStatus } from '../../domain/value-objects/role-assignment-status.js';

export interface RemoveRoleResult {
  id: string;
  membershipId: string;
  roleId: string;
  status: RoleAssignmentStatus;
  createdAt: string;
  reactivatedAt: string | null;
  removedAt: string | null;
}

export function toRemoveRoleResult(
  assignment: RoleAssignment,
): RemoveRoleResult {
  return {
    id: assignment.getId().toString(),
    membershipId: assignment.getMembershipId().toString(),
    roleId: assignment.getRoleId().toString(),
    status: assignment.getStatus(),
    createdAt: assignment.getCreatedAt().toISOString(),
    reactivatedAt: assignment.getReactivatedAt()?.toISOString() ?? null,
    removedAt: assignment.getRemovedAt()?.toISOString() ?? null,
  };
}
