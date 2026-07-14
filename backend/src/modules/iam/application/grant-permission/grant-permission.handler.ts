import type { PermissionAssignmentRepository } from '../../domain/repositories/permission-assignment-repository.js';
import type { PermissionRepository } from '../../domain/repositories/permission-repository.js';
import type { RoleRepository } from '../../domain/repositories/role-repository.js';
import { PermissionAssignment } from '../../domain/aggregates/permission-assignment.aggregate.js';
import { PermissionId } from '../../domain/value-objects/permission-id.js';
import { RoleId } from '../../domain/value-objects/role-id.js';
import type { EventDispatcher } from '../../../../core/application/events/event-dispatcher.js';
import { executePermissionAssignmentUseCase } from '../execute-permission-assignment-use-case.js';
import { PermissionAssignmentAlreadyExistsError } from '../errors/permission-assignment-already-exists.error.js';
import { PermissionNotFoundError } from '../errors/permission-not-found.error.js';
import { PermissionTenantMismatchError } from '../errors/permission-tenant-mismatch.error.js';
import { RoleNotFoundError } from '../errors/role-not-found.error.js';
import { GrantPermissionCommand } from './grant-permission.command.js';
import { toGrantPermissionResponse } from './grant-permission.response.js';

export class GrantPermissionHandler {
  constructor(
    private readonly permissionAssignmentRepository: PermissionAssignmentRepository,
    private readonly roleRepository: RoleRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly eventDispatcher: EventDispatcher,
  ) {}

  async execute(command: GrantPermissionCommand) {
    return executePermissionAssignmentUseCase(async () => {
      const roleId = RoleId.create(command.request.roleId);
      const permissionId = PermissionId.create(command.request.permissionId);

      const role = await this.roleRepository.findById(roleId);

      if (!role) {
        throw new RoleNotFoundError(command.request.roleId);
      }

      const permission = await this.permissionRepository.findById(permissionId);

      if (!permission) {
        throw new PermissionNotFoundError(command.request.permissionId);
      }

      const roleTenantId = role.getTenantId().toString();
      const permissionTenantId = permission.getTenantId().toString();

      if (roleTenantId !== permissionTenantId) {
        throw new PermissionTenantMismatchError(
          command.request.roleId,
          command.request.permissionId,
          roleTenantId,
          permissionTenantId,
        );
      }

      const existing =
        await this.permissionAssignmentRepository.findByRoleAndPermission(
          roleId,
          permissionId,
        );

      if (!existing) {
        const assignment = PermissionAssignment.create(
          { roleId, permissionId },
          roleTenantId,
        );

        await this.permissionAssignmentRepository.save(assignment);
        await this.eventDispatcher.dispatch(assignment.pullDomainEvents());

        return toGrantPermissionResponse(assignment);
      }

      if (existing.isRemoved()) {
        existing.reactivate(roleTenantId);
        const events = existing.pullDomainEvents();

        await this.permissionAssignmentRepository.save(existing);
        await this.eventDispatcher.dispatch(events);

        return toGrantPermissionResponse(existing);
      }

      throw new PermissionAssignmentAlreadyExistsError(
        command.request.roleId,
        command.request.permissionId,
      );
    });
  }
}
