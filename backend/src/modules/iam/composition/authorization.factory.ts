import { AuthorizationEngine } from '../application/authorization/authorization-engine.js';
import type { AuthorizationService } from '../application/authorization/authorization.service.js';
import { AuthenticatedOnlyPolicy } from '../application/authorization/policies/authenticated-only.policy.js';
import { MembershipResourceScopePolicy } from '../application/authorization/policies/membership-resource-scope.policy.js';
import { PermissionAssignmentResourceScopePolicy } from '../application/authorization/policies/permission-assignment-resource-scope.policy.js';
import { PermissionResourceScopePolicy } from '../application/authorization/policies/permission-resource-scope.policy.js';
import { RbacPermissionPolicy } from '../application/authorization/policies/rbac-permission.policy.js';
import { RoleAssignmentResourceScopePolicy } from '../application/authorization/policies/role-assignment-resource-scope.policy.js';
import { RoleResourceScopePolicy } from '../application/authorization/policies/role-resource-scope.policy.js';
import { TenantResourceScopePolicy } from '../application/authorization/policies/tenant-resource-scope.policy.js';
import type { MembershipRepository } from '../domain/repositories/membership-repository.js';
import type { PermissionAssignmentRepository } from '../domain/repositories/permission-assignment-repository.js';
import type { PermissionRepository } from '../domain/repositories/permission-repository.js';
import type { RoleAssignmentRepository } from '../domain/repositories/role-assignment-repository.js';
import type { RoleRepository } from '../domain/repositories/role-repository.js';
import { CompositeAuthorizationScopeResolver } from '../infrastructure/authorization/composite-authorization-scope-resolver.js';
import { DefaultAuthorizationService } from '../infrastructure/authorization/default-authorization.service.js';
import { MembershipScopeResolver } from '../infrastructure/authorization/membership-scope-resolver.js';
import { PermissionAssignmentScopeResolver } from '../infrastructure/authorization/permission-assignment-scope-resolver.js';
import { PermissionScopeResolver } from '../infrastructure/authorization/permission-scope-resolver.js';
import { RepositoryEffectivePermissionResolver } from '../infrastructure/authorization/repository-effective-permission-resolver.js';
import { RoleAssignmentScopeResolver } from '../infrastructure/authorization/role-assignment-scope-resolver.js';
import { RoleScopeResolver } from '../infrastructure/authorization/role-scope-resolver.js';

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
    new RoleResourceScopePolicy(),
    new RoleAssignmentResourceScopePolicy(),
    new PermissionResourceScopePolicy(),
    new PermissionAssignmentResourceScopePolicy(),
    new RbacPermissionPolicy(),
    new AuthenticatedOnlyPolicy(),
  ]);

  const scopeResolver = new CompositeAuthorizationScopeResolver([
    new MembershipScopeResolver(dependencies.membershipRepository),
    new RoleScopeResolver(dependencies.roleRepository),
    new PermissionScopeResolver(dependencies.permissionRepository),
    new RoleAssignmentScopeResolver(
      dependencies.roleAssignmentRepository,
      dependencies.membershipRepository,
      dependencies.roleRepository,
    ),
    new PermissionAssignmentScopeResolver(
      dependencies.permissionAssignmentRepository,
      dependencies.roleRepository,
      dependencies.permissionRepository,
    ),
  ]);

  return new DefaultAuthorizationService(
    effectivePermissionResolver,
    scopeResolver,
    engine,
  );
}
