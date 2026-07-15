import type { MembershipRepository } from '../../domain/repositories/membership-repository.js';
import { MembershipId } from '../../domain/value-objects/membership-id.js';
import type { AuthorizationContext } from '../../application/authorization/authorization-context.js';
import { AuthorizationAction } from '../../application/authorization/authorization-action.js';
import { AuthorizationResource } from '../../application/authorization/authorization-resource.js';
import type { AuthorizationScopeResolver } from '../../application/ports/authorization-scope-resolver.port.js';

export class RepositoryMembershipScopeResolver implements AuthorizationScopeResolver {
  constructor(private readonly membershipRepository: MembershipRepository) {}

  async enrich(context: AuthorizationContext): Promise<AuthorizationContext> {
    if (
      context.resource !== AuthorizationResource.MEMBERSHIP
      || context.action !== AuthorizationAction.READ
      || context.resourceId === null
    ) {
      return context;
    }

    const membership = await this.membershipRepository.findById(
      MembershipId.create(context.resourceId),
    );

    return {
      ...context,
      resourceTenantId: membership?.getTenantId().toString() ?? null,
    };
  }
}
