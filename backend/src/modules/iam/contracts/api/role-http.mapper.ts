import { AssignRoleCommand } from '../../application/assign-role/assign-role.command.js';
import type { AssignRoleResponse } from '../../application/assign-role/assign-role.response.js';
import { CreateRoleCommand } from '../../application/create-role/create-role.command.js';
import type { CreateRoleResponse } from '../../application/create-role/create-role.response.js';
import type { FindRoleAssignmentResult } from '../../application/find-role-assignment/find-role-assignment.result.js';
import type { FindRoleResult } from '../../application/find-role/find-role.result.js';
import { RemoveRoleCommand } from '../../application/remove-role/remove-role.command.js';
import type { RemoveRoleResult } from '../../application/remove-role/remove-role.result.js';
import type {
  CreateRoleAssignmentBody,
  CreateRoleBody,
} from './schemas/role.schemas.js';

export function toCreateRoleCommand(body: CreateRoleBody): CreateRoleCommand {
  return new CreateRoleCommand({
    tenantId: body.tenantId,
    name: body.name,
  });
}

export function toAssignRoleCommand(
  body: CreateRoleAssignmentBody,
): AssignRoleCommand {
  return new AssignRoleCommand({
    membershipId: body.membershipId,
    roleId: body.roleId,
  });
}

export function toRemoveRoleCommand(params: {
  membershipId: string;
  roleId: string;
}): RemoveRoleCommand {
  return new RemoveRoleCommand({
    membershipId: params.membershipId,
    roleId: params.roleId,
  });
}

export function toRoleHttpResponse(
  result: CreateRoleResponse | FindRoleResult,
) {
  return {
    id: result.id,
    tenantId: result.tenantId,
    name: result.name,
    createdAt: result.createdAt,
  };
}

export function toRoleAssignmentHttpResponse(
  result:
    | AssignRoleResponse
    | FindRoleAssignmentResult
    | RemoveRoleResult,
) {
  return {
    id: result.id,
    membershipId: result.membershipId,
    roleId: result.roleId,
    status: result.status,
    createdAt: result.createdAt,
    reactivatedAt: result.reactivatedAt,
    removedAt: result.removedAt,
  };
}
