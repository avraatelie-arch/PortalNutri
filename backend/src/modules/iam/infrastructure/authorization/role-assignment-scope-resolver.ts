import type { MembershipRepository } from '../../domain/repositories/membership-repository.js';
import type { RoleAssignmentRepository } from '../../domain/repositories/role-assignment-repository.js';
import type { RoleRepository } from '../../domain/repositories/role-repository.js';
import { MembershipId } from '../../domain/value-objects/membership-id.js';
import { RoleAssignmentId } from '../../domain/value-objects/role-assignment-id.js';
import { RoleId } from '../../domain/value-objects/role-id.js';
import type { AuthorizationContext } from '../../application/authorization/authorization-context.js';
import { AuthorizationAction } from '../../application/authorization/authorization-action.js';
import { AuthorizationResource } from '../../application/authorization/authorization-resource.js';
import { withResolvedTenantIds } from '../../application/authorization/resolved-tenant-ids.js';
import type { AuthorizationScopeResolver } from '../../application/ports/authorization-scope-resolver.port.js';

export class RoleAssignmentScopeResolver implements AuthorizationScopeResolver {
  constructor(
    private readonly roleAssignmentRepository: RoleAssignmentRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly roleRepository: RoleRepository,
  ) {}

  async enrich(context: AuthorizationContext): Promise<AuthorizationContext> {
    if (context.resource !== AuthorizationResource.ROLE_ASSIGNMENT) {
      return context;
    }

    if (context.action === AuthorizationAction.READ && context.resourceId) {
      const assignment = await this.roleAssignmentRepository.findById(
        RoleAssignmentId.create(context.resourceId),
      );

      if (!assignment) {
        return context;
      }

      const membership = await this.membershipRepository.findById(
        assignment.getMembershipId(),
      );

      return withResolvedTenantIds(
        context,
        [membership?.getTenantId().toString()],
      );
    }

    if (
      context.action === AuthorizationAction.CREATE
      || context.action === AuthorizationAction.DELETE
    ) {
      const membershipId = context.scopeRefs.membershipId;
      const roleId = context.scopeRefs.roleId;

      if (!membershipId || !roleId) {
        return context;
      }

      const [membership, role] = await Promise.all([
        this.membershipRepository.findById(MembershipId.create(membershipId)),
        this.roleRepository.findById(RoleId.create(roleId)),
      ]);

      return withResolvedTenantIds(context, [
        membership?.getTenantId().toString(),
        role?.getTenantId().toString(),
      ]);
    }

    return context;
  }
}
