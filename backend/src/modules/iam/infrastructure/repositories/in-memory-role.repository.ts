import type { RoleRepository } from '../../domain/repositories/role-repository.js';
import type { Role } from '../../domain/aggregates/role.aggregate.js';
import type { RoleId } from '../../domain/value-objects/role-id.js';
import type { TenantId } from '../../domain/value-objects/tenant-id.js';
import { normalizeRoleNameForPersistence } from '../prisma/role-name-normalizer.js';

export class InMemoryRoleRepository implements RoleRepository {
  private readonly roles = new Map<string, Role>();

  async save(role: Role): Promise<void> {
    this.roles.set(role.getId().toString(), role);
  }

  async findById(id: RoleId): Promise<Role | null> {
    return this.roles.get(id.toString()) ?? null;
  }

  async existsByTenantAndNormalizedName(
    tenantId: TenantId,
    normalizedName: string,
  ): Promise<boolean> {
    for (const role of this.roles.values()) {
      if (
        role.getTenantId().equals(tenantId)
        && normalizeRoleNameForPersistence(role.getName().toString())
          === normalizedName
      ) {
        return true;
      }
    }

    return false;
  }
}
