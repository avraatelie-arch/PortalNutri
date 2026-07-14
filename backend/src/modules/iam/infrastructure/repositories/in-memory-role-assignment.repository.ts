import type { RoleAssignmentRepository } from '../../domain/repositories/role-assignment-repository.js';
import type { RoleAssignment } from '../../domain/aggregates/role-assignment.aggregate.js';
import type { MembershipId } from '../../domain/value-objects/membership-id.js';
import type { RoleAssignmentId } from '../../domain/value-objects/role-assignment-id.js';
import type { RoleId } from '../../domain/value-objects/role-id.js';

export class InMemoryRoleAssignmentRepository
  implements RoleAssignmentRepository
{
  private readonly assignments = new Map<string, RoleAssignment>();

  async save(assignment: RoleAssignment): Promise<void> {
    this.assignments.set(assignment.getId().toString(), assignment);
  }

  async findById(id: RoleAssignmentId): Promise<RoleAssignment | null> {
    return this.assignments.get(id.toString()) ?? null;
  }

  async findByMembershipAndRole(
    membershipId: MembershipId,
    roleId: RoleId,
  ): Promise<RoleAssignment | null> {
    for (const assignment of this.assignments.values()) {
      if (
        assignment.getMembershipId().equals(membershipId)
        && assignment.getRoleId().equals(roleId)
      ) {
        return assignment;
      }
    }

    return null;
  }
}
