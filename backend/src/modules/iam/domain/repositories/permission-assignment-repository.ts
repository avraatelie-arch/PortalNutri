import type { PermissionAssignment } from '../aggregates/permission-assignment.aggregate.js';
import type { PermissionAssignmentId } from '../value-objects/permission-assignment-id.js';
import type { PermissionId } from '../value-objects/permission-id.js';
import type { RoleId } from '../value-objects/role-id.js';

export interface PermissionAssignmentRepository {
  save(assignment: PermissionAssignment): Promise<void>;
  findById(id: PermissionAssignmentId): Promise<PermissionAssignment | null>;
  findByRoleAndPermission(
    roleId: RoleId,
    permissionId: PermissionId,
  ): Promise<PermissionAssignment | null>;
}
