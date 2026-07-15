import type { PermissionAssignmentRepository } from '../../domain/repositories/permission-assignment-repository.js';
import type { PermissionRepository } from '../../domain/repositories/permission-repository.js';
import type { RoleRepository } from '../../domain/repositories/role-repository.js';
import { PermissionAssignmentId } from '../../domain/value-objects/permission-assignment-id.js';
import { PermissionId } from '../../domain/value-objects/permission-id.js';
import { RoleId } from '../../domain/value-objects/role-id.js';
import type { AuthorizationContext } from '../../application/authorization/authorization-context.js';
import { AuthorizationAction } from '../../application/authorization/authorization-action.js';
import { AuthorizationResource } from '../../application/authorization/authorization-resource.js';
import { withResolvedTenantIds } from '../../application/authorization/resolved-tenant-ids.js';
import type { AuthorizationScopeResolver } from '../../application/ports/authorization-scope-resolver.port.js';

export class PermissionAssignmentScopeResolver implements AuthorizationScopeResolver {
  constructor(
    private readonly permissionAssignmentRepository: PermissionAssignmentRepository,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async enrich(context: AuthorizationContext): Promise<AuthorizationContext> {
    if (context.resource !== AuthorizationResource.PERMISSION_ASSIGNMENT) {
      return context;
    }

    if (context.action === AuthorizationAction.READ && context.resourceId) {
      const assignment = await this.permissionAssignmentRepository.findById(
        PermissionAssignmentId.create(context.resourceId),
      );

      if (!assignment) {
        return context;
      }

      const role = await this.roleRepository.findById(assignment.getRoleId());

      return withResolvedTenantIds(context, [role?.getTenantId().toString()]);
    }

    if (
      context.action === AuthorizationAction.CREATE
      || context.action === AuthorizationAction.DELETE
    ) {
      const roleId = context.scopeRefs.roleId;
      const permissionId = context.scopeRefs.permissionId;

      if (!roleId || !permissionId) {
        return context;
      }

      const [role, permission] = await Promise.all([
        this.roleRepository.findById(RoleId.create(roleId)),
        this.permissionRepository.findById(PermissionId.create(permissionId)),
      ]);

      return withResolvedTenantIds(context, [
        role?.getTenantId().toString(),
        permission?.getTenantId().toString(),
      ]);
    }

    return context;
  }
}
