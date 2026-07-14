import type { PermissionAssignmentRepository } from '../../domain/repositories/permission-assignment-repository.js';
import type { RoleRepository } from '../../domain/repositories/role-repository.js';
import { PermissionId } from '../../domain/value-objects/permission-id.js';
import { RoleId } from '../../domain/value-objects/role-id.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executePermissionAssignmentUseCase } from '../execute-permission-assignment-use-case.js';
import { PermissionAssignmentNotFoundError } from '../errors/permission-assignment-not-found.error.js';
import { RoleNotFoundError } from '../errors/role-not-found.error.js';
import { RevokePermissionCommand } from './revoke-permission.command.js';
import { toRevokePermissionResult } from './revoke-permission.result.js';

export class RevokePermissionHandler {
  constructor(
    private readonly permissionAssignmentRepository: PermissionAssignmentRepository,
    private readonly roleRepository: RoleRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: RevokePermissionCommand) {
    return executePermissionAssignmentUseCase(async () => {
      const roleId = RoleId.create(command.request.roleId);
      const permissionId = PermissionId.create(command.request.permissionId);

      const assignment =
        await this.permissionAssignmentRepository.findByRoleAndPermission(
          roleId,
          permissionId,
        );

      if (!assignment) {
        throw new PermissionAssignmentNotFoundError(
          command.request.roleId,
          command.request.permissionId,
        );
      }

      const role = await this.roleRepository.findById(roleId);

      if (!role) {
        throw new RoleNotFoundError(command.request.roleId);
      }

      assignment.remove(role.getTenantId().toString());
      const events = assignment.pullDomainEvents();

      if (events.length > 0) {
        await this.permissionAssignmentRepository.save(assignment);
        await this.eventDispatcher.dispatch(events);
      }

      return toRevokePermissionResult(assignment);
    });
  }
}
