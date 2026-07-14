import type { EventDispatcher } from '../../../core/application/events/event-dispatcher.js';
import type { MembershipRepository } from '../domain/repositories/membership-repository.js';
import type { RoleAssignmentRepository } from '../domain/repositories/role-assignment-repository.js';
import type { RoleRepository } from '../domain/repositories/role-repository.js';
import type { TenantRepository } from '../domain/repositories/tenant-repository.js';
import { AssignRoleHandler } from '../application/assign-role/assign-role.handler.js';
import { CreateRoleHandler } from '../application/create-role/create-role.handler.js';
import { FindRoleAssignmentHandler } from '../application/find-role-assignment/find-role-assignment.handler.js';
import { FindRoleHandler } from '../application/find-role/find-role.handler.js';
import { RemoveRoleHandler } from '../application/remove-role/remove-role.handler.js';

export interface RoleFactoryDependencies {
  roleRepository: RoleRepository;
  roleAssignmentRepository: RoleAssignmentRepository;
  membershipRepository: MembershipRepository;
  tenantRepository: TenantRepository;
  eventDispatcher: EventDispatcher;
}

export interface RoleHandlers {
  createRoleHandler: CreateRoleHandler;
  findRoleHandler: FindRoleHandler;
  assignRoleHandler: AssignRoleHandler;
  removeRoleHandler: RemoveRoleHandler;
  findRoleAssignmentHandler: FindRoleAssignmentHandler;
}

export function createRoleHandlers({
  roleRepository,
  roleAssignmentRepository,
  membershipRepository,
  tenantRepository,
  eventDispatcher,
}: RoleFactoryDependencies): RoleHandlers {
  return {
    createRoleHandler: new CreateRoleHandler(
      roleRepository,
      tenantRepository,
      eventDispatcher,
    ),
    findRoleHandler: new FindRoleHandler(roleRepository),
    assignRoleHandler: new AssignRoleHandler(
      roleAssignmentRepository,
      membershipRepository,
      roleRepository,
      eventDispatcher,
    ),
    removeRoleHandler: new RemoveRoleHandler(
      roleAssignmentRepository,
      membershipRepository,
      eventDispatcher,
    ),
    findRoleAssignmentHandler: new FindRoleAssignmentHandler(
      roleAssignmentRepository,
    ),
  };
}
