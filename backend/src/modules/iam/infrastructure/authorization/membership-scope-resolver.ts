import type { MembershipRepository } from '../../domain/repositories/membership-repository.js';
import { MembershipId } from '../../domain/value-objects/membership-id.js';
import type { AuthorizationContext } from '../../application/authorization/authorization-context.js';
import { AuthorizationAction } from '../../application/authorization/authorization-action.js';
import { AuthorizationResource } from '../../application/authorization/authorization-resource.js';
import { withResolvedTenantIds } from '../../application/authorization/resolved-tenant-ids.js';
import type { AuthorizationScopeResolver } from '../../application/ports/authorization-scope-resolver.port.js';

export class MembershipScopeResolver implements AuthorizationScopeResolver {
  constructor(private readonly membershipRepository: MembershipRepository) {}

  async enrich(context: AuthorizationContext): Promise<AuthorizationContext> {
    if (context.resource !== AuthorizationResource.MEMBERSHIP) {
      return context;
    }

    if (
      context.action === AuthorizationAction.READ
      && context.resourceId !== null
    ) {
      const membership = await this.membershipRepository.findById(
        MembershipId.create(context.resourceId),
      );

      return withResolvedTenantIds(
        context,
        [membership?.getTenantId().toString()],
      );
    }

    if (
      context.action === AuthorizationAction.CREATE
      && context.scopeRefs.tenantId !== undefined
    ) {
      return withResolvedTenantIds(context, [context.scopeRefs.tenantId]);
    }

    if (
      context.action === AuthorizationAction.DELETE
      && context.scopeRefs.tenantId !== undefined
    ) {
      return withResolvedTenantIds(context, [context.scopeRefs.tenantId]);
    }

    return context;
  }
}
