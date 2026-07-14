import type { Permission } from '../../domain/aggregates/permission.aggregate.js';

export interface FindPermissionResult {
  id: string;
  tenantId: string;
  name: string;
  createdAt: string;
}

export function toFindPermissionResult(
  permission: Permission,
): FindPermissionResult {
  return {
    id: permission.getId().toString(),
    tenantId: permission.getTenantId().toString(),
    name: permission.getName().toString(),
    createdAt: permission.getCreatedAt().toISOString(),
  };
}
