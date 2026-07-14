import type { Permission } from '../../domain/aggregates/permission.aggregate.js';

export interface CreatePermissionResponse {
  id: string;
  tenantId: string;
  name: string;
  createdAt: string;
}

export function toCreatePermissionResponse(
  permission: Permission,
): CreatePermissionResponse {
  return {
    id: permission.getId().toString(),
    tenantId: permission.getTenantId().toString(),
    name: permission.getName().toString(),
    createdAt: permission.getCreatedAt().toISOString(),
  };
}
