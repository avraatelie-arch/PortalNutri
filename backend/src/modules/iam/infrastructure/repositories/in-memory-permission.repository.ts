import type { PermissionRepository } from '../../domain/repositories/permission-repository.js';
import type { Permission } from '../../domain/aggregates/permission.aggregate.js';
import type { PermissionId } from '../../domain/value-objects/permission-id.js';
import type { TenantId } from '../../domain/value-objects/tenant-id.js';

export class InMemoryPermissionRepository implements PermissionRepository {
  private readonly permissions = new Map<string, Permission>();

  async save(permission: Permission): Promise<void> {
    this.permissions.set(permission.getId().toString(), permission);
  }

  async findById(id: PermissionId): Promise<Permission | null> {
    return this.permissions.get(id.toString()) ?? null;
  }

  async existsByTenantAndNormalizedName(
    tenantId: TenantId,
    normalizedName: string,
  ): Promise<boolean> {
    for (const permission of this.permissions.values()) {
      if (
        permission.getTenantId().equals(tenantId)
        && permission.getName().normalizedValue === normalizedName
      ) {
        return true;
      }
    }

    return false;
  }
}
