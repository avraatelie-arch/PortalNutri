import type { EffectivePermissionResolver } from '../../application/ports/effective-permission-resolver.port.js';
import type { MembershipRepository } from '../../domain/repositories/membership-repository.js';
import type { PermissionAssignmentRepository } from '../../domain/repositories/permission-assignment-repository.js';
import type { PermissionRepository } from '../../domain/repositories/permission-repository.js';
import type { RoleAssignmentRepository } from '../../domain/repositories/role-assignment-repository.js';
import type { RoleRepository } from '../../domain/repositories/role-repository.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';

export interface RepositoryEffectivePermissionResolverDependencies {
  membershipRepository: MembershipRepository;
  roleAssignmentRepository: RoleAssignmentRepository;
  roleRepository: RoleRepository;
  permissionAssignmentRepository: PermissionAssignmentRepository;
  permissionRepository: PermissionRepository;
}

export class RepositoryEffectivePermissionResolver
  implements EffectivePermissionResolver
{
  constructor(
    private readonly dependencies: RepositoryEffectivePermissionResolverDependencies,
  ) {}

  async hasActivePermission(params: {
    personId: string;
    tenantId: string;
    permissionKey: string;
  }): Promise<boolean> {
    const personId = PersonId.create(params.personId);
    const tenantId = TenantId.create(params.tenantId);

    const membership = await this.dependencies.membershipRepository
      .findByPersonAndTenant(personId, tenantId);

    if (!membership || !membership.isActive()) {
      return false;
    }

    const permission = await this.dependencies.permissionRepository
      .findByTenantAndNormalizedName(tenantId, params.permissionKey);

    if (!permission) {
      return false;
    }

    const roleAssignments = await this.dependencies.roleAssignmentRepository
      .findActiveByMembershipId(membership.getId());

    for (const roleAssignment of roleAssignments) {
      const role = await this.dependencies.roleRepository.findById(
        roleAssignment.getRoleId(),
      );

      if (!role || !role.getTenantId().equals(tenantId)) {
        continue;
      }

      const permissionAssignments = await this.dependencies
        .permissionAssignmentRepository
        .findActiveByRoleId(roleAssignment.getRoleId());

      for (const permissionAssignment of permissionAssignments) {
        if (
          permissionAssignment.getPermissionId().equals(permission.getId())
        ) {
          return true;
        }
      }
    }

    return false;
  }
}
