import type { Role } from '../../domain/aggregates/role.aggregate.js';

export interface CreateRoleResponse {
  id: string;
  tenantId: string;
  name: string;
  createdAt: string;
}

export function toCreateRoleResponse(role: Role): CreateRoleResponse {
  return {
    id: role.getId().toString(),
    tenantId: role.getTenantId().toString(),
    name: role.getName().toString(),
    createdAt: role.getCreatedAt().toISOString(),
  };
}
