import type { RoleRepository } from '../../domain/repositories/role-repository.js';
import { RoleId } from '../../domain/value-objects/role-id.js';
import type { AuthorizationContext } from '../../application/authorization/authorization-context.js';
import { AuthorizationAction } from '../../application/authorization/authorization-action.js';
import { AuthorizationResource } from '../../application/authorization/authorization-resource.js';
import { withResolvedTenantIds } from '../../application/authorization/resolved-tenant-ids.js';
import type { AuthorizationScopeResolver } from '../../application/ports/authorization-scope-resolver.port.js';

export class RoleScopeResolver implements AuthorizationScopeResolver {
  constructor(private readonly roleRepository: RoleRepository) {}

  async enrich(context: AuthorizationContext): Promise<AuthorizationContext> {
    if (context.resource !== AuthorizationResource.ROLE) {
      return context;
    }

    if (
      context.action === AuthorizationAction.READ
      && context.resourceId !== null
    ) {
      const role = await this.roleRepository.findById(
        RoleId.create(context.resourceId),
      );

      return withResolvedTenantIds(context, [role?.getTenantId().toString()]);
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
