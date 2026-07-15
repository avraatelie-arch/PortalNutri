import type { RoleAssignment } from '../../domain/aggregates/role-assignment.aggregate.js';
import type { RoleAssignmentStatus } from '../../domain/value-objects/role-assignment-status.js';

export type AssignRoleOperation = 'CREATED' | 'REACTIVATED';

export interface AssignRoleResponse {
  id: string;
  membershipId: string;
  roleId: string;
  status: RoleAssignmentStatus;
  createdAt: string;
  reactivatedAt: string | null;
  removedAt: string | null;
  operation: AssignRoleOperation;
}

export function toAssignRoleResponse(
  assignment: RoleAssignment,
  operation: AssignRoleOperation,
): AssignRoleResponse {
  return {
    id: assignment.getId().toString(),
    membershipId: assignment.getMembershipId().toString(),
    roleId: assignment.getRoleId().toString(),
    status: assignment.getStatus(),
    createdAt: assignment.getCreatedAt().toISOString(),
    reactivatedAt: assignment.getReactivatedAt()?.toISOString() ?? null,
    removedAt: assignment.getRemovedAt()?.toISOString() ?? null,
    operation,
  };
}
