import type { MembershipRepository } from '../../domain/repositories/membership-repository.js';
import type { RoleAssignmentRepository } from '../../domain/repositories/role-assignment-repository.js';
import type { RoleRepository } from '../../domain/repositories/role-repository.js';
import { RoleAssignment } from '../../domain/aggregates/role-assignment.aggregate.js';
import { MembershipId } from '../../domain/value-objects/membership-id.js';
import { RoleId } from '../../domain/value-objects/role-id.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeRoleAssignmentUseCase } from '../execute-role-assignment-use-case.js';
import { MembershipInactiveError } from '../errors/membership-inactive.error.js';
import { MembershipNotFoundError } from '../errors/membership-not-found.error.js';
import { RoleAssignmentAlreadyExistsError } from '../errors/role-assignment-already-exists.error.js';
import { RoleNotFoundError } from '../errors/role-not-found.error.js';
import { RoleTenantMismatchError } from '../errors/role-tenant-mismatch.error.js';
import { AssignRoleCommand } from './assign-role.command.js';
import { toAssignRoleResponse } from './assign-role.response.js';

export class AssignRoleHandler {
  constructor(
    private readonly roleAssignmentRepository: RoleAssignmentRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly roleRepository: RoleRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: AssignRoleCommand) {
    return executeRoleAssignmentUseCase(async () => {
      const membershipId = MembershipId.create(command.request.membershipId);
      const roleId = RoleId.create(command.request.roleId);

      const membership = await this.membershipRepository.findById(membershipId);

      if (!membership) {
        throw new MembershipNotFoundError(command.request.membershipId);
      }

      if (!membership.isActive()) {
        throw new MembershipInactiveError(command.request.membershipId);
      }

      const role = await this.roleRepository.findById(roleId);

      if (!role) {
        throw new RoleNotFoundError(command.request.roleId);
      }

      const membershipTenantId = membership.getTenantId().toString();
      const roleTenantId = role.getTenantId().toString();

      if (roleTenantId !== membershipTenantId) {
        throw new RoleTenantMismatchError(
          command.request.membershipId,
          command.request.roleId,
          membershipTenantId,
          roleTenantId,
        );
      }

      const existing = await this.roleAssignmentRepository.findByMembershipAndRole(
        membershipId,
        roleId,
      );

      if (!existing) {
        const assignment = RoleAssignment.create(
          { membershipId, roleId },
          membershipTenantId,
        );

        await this.roleAssignmentRepository.save(assignment);
        await this.eventDispatcher.dispatch(assignment.pullDomainEvents());

        return toAssignRoleResponse(assignment);
      }

      if (existing.isRemoved()) {
        existing.reactivate(membershipTenantId);
        const events = existing.pullDomainEvents();

        await this.roleAssignmentRepository.save(existing);
        await this.eventDispatcher.dispatch(events);

        return toAssignRoleResponse(existing);
      }

      throw new RoleAssignmentAlreadyExistsError(
        command.request.membershipId,
        command.request.roleId,
      );
    });
  }
}
