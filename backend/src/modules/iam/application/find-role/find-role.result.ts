import type { Role } from '../../domain/aggregates/role.aggregate.js';

export interface FindRoleResult {
  id: string;
  tenantId: string;
  name: string;
  createdAt: string;
}

export function toFindRoleResult(role: Role): FindRoleResult {
  return {
    id: role.getId().toString(),
    tenantId: role.getTenantId().toString(),
    name: role.getName().toString(),
    createdAt: role.getCreatedAt().toISOString(),
  };
}
