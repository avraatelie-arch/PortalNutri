import type { PermissionAssignmentRepository } from '../../domain/repositories/permission-assignment-repository.js';
import type { PermissionAssignment } from '../../domain/aggregates/permission-assignment.aggregate.js';
import type { PermissionAssignmentId } from '../../domain/value-objects/permission-assignment-id.js';
import type { PermissionId } from '../../domain/value-objects/permission-id.js';
import type { RoleId } from '../../domain/value-objects/role-id.js';

export class InMemoryPermissionAssignmentRepository
  implements PermissionAssignmentRepository
{
  private readonly assignments = new Map<string, PermissionAssignment>();

  async save(assignment: PermissionAssignment): Promise<void> {
    this.assignments.set(assignment.getId().toString(), assignment);
  }

  async findById(
    id: PermissionAssignmentId,
  ): Promise<PermissionAssignment | null> {
    return this.assignments.get(id.toString()) ?? null;
  }

  async findByRoleAndPermission(
    roleId: RoleId,
    permissionId: PermissionId,
  ): Promise<PermissionAssignment | null> {
    for (const assignment of this.assignments.values()) {
      if (
        assignment.getRoleId().equals(roleId)
        && assignment.getPermissionId().equals(permissionId)
      ) {
        return assignment;
      }
    }

    return null;
  }
}
