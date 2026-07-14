import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import type { PermissionAssignmentRepository } from '../domain/repositories/permission-assignment-repository.js';
import type { PermissionRepository } from '../domain/repositories/permission-repository.js';
import type { RoleRepository } from '../domain/repositories/role-repository.js';
import type { TenantRepository } from '../domain/repositories/tenant-repository.js';
import { CreatePermissionHandler } from '../application/create-permission/create-permission.handler.js';
import { FindPermissionAssignmentHandler } from '../application/find-permission-assignment/find-permission-assignment.handler.js';
import { FindPermissionHandler } from '../application/find-permission/find-permission.handler.js';
import { GrantPermissionHandler } from '../application/grant-permission/grant-permission.handler.js';
import { RevokePermissionHandler } from '../application/revoke-permission/revoke-permission.handler.js';

export interface PermissionFactoryDependencies {
  permissionRepository: PermissionRepository;
  permissionAssignmentRepository: PermissionAssignmentRepository;
  roleRepository: RoleRepository;
  tenantRepository: TenantRepository;
  eventDispatcher: EventDispatcher;
}

export interface PermissionHandlers {
  createPermissionHandler: CreatePermissionHandler;
  findPermissionHandler: FindPermissionHandler;
  grantPermissionHandler: GrantPermissionHandler;
  revokePermissionHandler: RevokePermissionHandler;
  findPermissionAssignmentHandler: FindPermissionAssignmentHandler;
}

export function createPermissionHandlers({
  permissionRepository,
  permissionAssignmentRepository,
  roleRepository,
  tenantRepository,
  eventDispatcher,
}: PermissionFactoryDependencies): PermissionHandlers {
  return {
    createPermissionHandler: new CreatePermissionHandler(
      permissionRepository,
      tenantRepository,
      eventDispatcher,
    ),
    findPermissionHandler: new FindPermissionHandler(permissionRepository),
    grantPermissionHandler: new GrantPermissionHandler(
      permissionAssignmentRepository,
      roleRepository,
      permissionRepository,
      eventDispatcher,
    ),
    revokePermissionHandler: new RevokePermissionHandler(
      permissionAssignmentRepository,
      roleRepository,
      eventDispatcher,
    ),
    findPermissionAssignmentHandler: new FindPermissionAssignmentHandler(
      permissionAssignmentRepository,
    ),
  };
}
