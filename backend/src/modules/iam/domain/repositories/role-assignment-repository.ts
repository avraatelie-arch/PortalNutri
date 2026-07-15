import type { RoleAssignment } from '../aggregates/role-assignment.aggregate.js';
import type { MembershipId } from '../value-objects/membership-id.js';
import type { RoleAssignmentId } from '../value-objects/role-assignment-id.js';
import type { RoleId } from '../value-objects/role-id.js';

export interface RoleAssignmentRepository {
  save(assignment: RoleAssignment): Promise<void>;
  findById(id: RoleAssignmentId): Promise<RoleAssignment | null>;
  findByMembershipAndRole(
    membershipId: MembershipId,
    roleId: RoleId,
  ): Promise<RoleAssignment | null>;
  findActiveByMembershipId(
    membershipId: MembershipId,
  ): Promise<RoleAssignment[]>;
}
