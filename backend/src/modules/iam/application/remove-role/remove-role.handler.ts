import type { MembershipRepository } from '../../domain/repositories/membership-repository.js';
import type { RoleAssignmentRepository } from '../../domain/repositories/role-assignment-repository.js';
import { MembershipId } from '../../domain/value-objects/membership-id.js';
import { RoleId } from '../../domain/value-objects/role-id.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executeRoleAssignmentUseCase } from '../execute-role-assignment-use-case.js';
import { RoleAssignmentNotFoundError } from '../errors/role-assignment-not-found.error.js';
import { MembershipNotFoundError } from '../errors/membership-not-found.error.js';
import { RemoveRoleCommand } from './remove-role.command.js';
import { toRemoveRoleResult } from './remove-role.result.js';

export class RemoveRoleHandler {
  constructor(
    private readonly roleAssignmentRepository: RoleAssignmentRepository,
    private readonly membershipRepository: MembershipRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: RemoveRoleCommand) {
    return executeRoleAssignmentUseCase(async () => {
      const membershipId = MembershipId.create(command.request.membershipId);
      const roleId = RoleId.create(command.request.roleId);

      const assignment = await this.roleAssignmentRepository.findByMembershipAndRole(
        membershipId,
        roleId,
      );

      if (!assignment) {
        throw new RoleAssignmentNotFoundError(
          command.request.membershipId,
          command.request.roleId,
        );
      }

      const membership = await this.membershipRepository.findById(membershipId);

      if (!membership) {
        throw new MembershipNotFoundError(command.request.membershipId);
      }

      assignment.remove(membership.getTenantId().toString());
      const events = assignment.pullDomainEvents();

      if (events.length > 0) {
        await this.roleAssignmentRepository.save(assignment);
        await this.eventDispatcher.dispatch(events);
      }

      return toRemoveRoleResult(assignment);
    });
  }
}
