import { CreatePermissionCommand } from '../../application/create-permission/create-permission.command.js';
import type { CreatePermissionResponse } from '../../application/create-permission/create-permission.response.js';
import type { FindPermissionAssignmentResult } from '../../application/find-permission-assignment/find-permission-assignment.result.js';
import type { FindPermissionResult } from '../../application/find-permission/find-permission.result.js';
import { GrantPermissionCommand } from '../../application/grant-permission/grant-permission.command.js';
import type { GrantPermissionResponse } from '../../application/grant-permission/grant-permission.response.js';
import { RevokePermissionCommand } from '../../application/revoke-permission/revoke-permission.command.js';
import type { RevokePermissionResult } from '../../application/revoke-permission/revoke-permission.result.js';
import type {
  CreatePermissionAssignmentBody,
  CreatePermissionBody,
} from './schemas/permission.schemas.js';

export function toCreatePermissionCommand(
  body: CreatePermissionBody,
): CreatePermissionCommand {
  return new CreatePermissionCommand({
    tenantId: body.tenantId,
    name: body.name,
  });
}

export function toGrantPermissionCommand(
  body: CreatePermissionAssignmentBody,
): GrantPermissionCommand {
  return new GrantPermissionCommand({
    roleId: body.roleId,
    permissionId: body.permissionId,
  });
}

export function toRevokePermissionCommand(params: {
  roleId: string;
  permissionId: string;
}): RevokePermissionCommand {
  return new RevokePermissionCommand({
    roleId: params.roleId,
    permissionId: params.permissionId,
  });
}

export function toPermissionHttpResponse(
  result: CreatePermissionResponse | FindPermissionResult,
) {
  return {
    id: result.id,
    tenantId: result.tenantId,
    name: result.name,
    createdAt: result.createdAt,
  };
}

export function toPermissionAssignmentHttpResponse(
  result:
    | GrantPermissionResponse
    | FindPermissionAssignmentResult
    | RevokePermissionResult,
) {
  return {
    id: result.id,
    roleId: result.roleId,
    permissionId: result.permissionId,
    status: result.status,
    createdAt: result.createdAt,
    reactivatedAt: result.reactivatedAt,
    removedAt: result.removedAt,
  };
}
