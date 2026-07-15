import { AuthorizationEngine } from '../application/authorization/authorization-engine.js';
import type { AuthorizationService } from '../application/authorization/authorization.service.js';
import { AuthenticatedOnlyPolicy } from '../application/authorization/policies/authenticated-only.policy.js';
import { MembershipResourceScopePolicy } from '../application/authorization/policies/membership-resource-scope.policy.js';
import { RbacPermissionPolicy } from '../application/authorization/policies/rbac-permission.policy.js';
import { TenantResourceScopePolicy } from '../application/authorization/policies/tenant-resource-scope.policy.js';
import type { MembershipRepository } from '../domain/repositories/membership-repository.js';
import type { PermissionAssignmentRepository } from '../domain/repositories/permission-assignment-repository.js';
import type { PermissionRepository } from '../domain/repositories/permission-repository.js';
import type { RoleAssignmentRepository } from '../domain/repositories/role-assignment-repository.js';
import type { RoleRepository } from '../domain/repositories/role-repository.js';
import { RepositoryMembershipScopeResolver } from '../infrastructure/authorization/repository-membership-scope-resolver.js';
import { DefaultAuthorizationService } from '../infrastructure/authorization/default-authorization.service.js';
import { RepositoryEffectivePermissionResolver } from '../infrastructure/authorization/repository-effective-permission-resolver.js';

export interface AuthorizationFactoryDependencies {
  membershipRepository: MembershipRepository;
  roleAssignmentRepository: RoleAssignmentRepository;
  roleRepository: RoleRepository;
  permissionAssignmentRepository: PermissionAssignmentRepository;
  permissionRepository: PermissionRepository;
}

export function createAuthorizationService(
  dependencies: AuthorizationFactoryDependencies,
): AuthorizationService {
  const effectivePermissionResolver = new RepositoryEffectivePermissionResolver(
    dependencies,
  );

  const engine = new AuthorizationEngine([
    new TenantResourceScopePolicy(),
    new MembershipResourceScopePolicy(),
    new RbacPermissionPolicy(),
    new AuthenticatedOnlyPolicy(),
  ]);

  return new DefaultAuthorizationService(
    effectivePermissionResolver,
    new RepositoryMembershipScopeResolver(dependencies.membershipRepository),
    engine,
  );
}
