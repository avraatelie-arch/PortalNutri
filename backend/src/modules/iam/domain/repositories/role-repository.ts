import type { Role } from '../aggregates/role.aggregate.js';
import type { RoleId } from '../value-objects/role-id.js';
import type { TenantId } from '../value-objects/tenant-id.js';

export interface RoleRepository {
  save(role: Role): Promise<void>;
  findById(id: RoleId): Promise<Role | null>;
  existsByTenantAndNormalizedName(
    tenantId: TenantId,
    normalizedName: string,
  ): Promise<boolean>;
}
