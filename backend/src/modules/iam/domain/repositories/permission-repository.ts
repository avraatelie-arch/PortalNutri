import type { Permission } from '../aggregates/permission.aggregate.js';
import type { PermissionId } from '../value-objects/permission-id.js';
import type { TenantId } from '../value-objects/tenant-id.js';

export interface PermissionRepository {
  save(permission: Permission): Promise<void>;
  findById(id: PermissionId): Promise<Permission | null>;
  existsByTenantAndNormalizedName(
    tenantId: TenantId,
    normalizedName: string,
  ): Promise<boolean>;
  findByTenantAndNormalizedName(
    tenantId: TenantId,
    normalizedName: string,
  ): Promise<Permission | null>;
}
