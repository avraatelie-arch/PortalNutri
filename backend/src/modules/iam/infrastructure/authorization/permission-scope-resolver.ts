import type { PermissionRepository } from '../../domain/repositories/permission-repository.js';
import { PermissionId } from '../../domain/value-objects/permission-id.js';
import type { AuthorizationContext } from '../../application/authorization/authorization-context.js';
import { AuthorizationAction } from '../../application/authorization/authorization-action.js';
import { AuthorizationResource } from '../../application/authorization/authorization-resource.js';
import { withResolvedTenantIds } from '../../application/authorization/resolved-tenant-ids.js';
import type { AuthorizationScopeResolver } from '../../application/ports/authorization-scope-resolver.port.js';

export class PermissionScopeResolver implements AuthorizationScopeResolver {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async enrich(context: AuthorizationContext): Promise<AuthorizationContext> {
    if (context.resource !== AuthorizationResource.PERMISSION) {
      return context;
    }

    if (
      context.action === AuthorizationAction.READ
      && context.resourceId !== null
    ) {
      const permission = await this.permissionRepository.findById(
        PermissionId.create(context.resourceId),
      );

      return withResolvedTenantIds(
        context,
        [permission?.getTenantId().toString()],
      );
    }

    if (
      context.action === AuthorizationAction.CREATE
      && context.scopeRefs.tenantId !== undefined
    ) {
      return withResolvedTenantIds(context, [context.scopeRefs.tenantId]);
    }

    return context;
  }
}
