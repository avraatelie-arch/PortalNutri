import type { TenantRepository } from '../../domain/repositories/tenant-repository.js';
import type { Tenant } from '../../domain/aggregates/tenant.aggregate.js';
import type { TenantId } from '../../domain/value-objects/tenant-id.js';
import type { TenantSlug } from '../../domain/value-objects/tenant-slug.js';

export class InMemoryTenantRepository implements TenantRepository {
  private readonly tenants = new Map<string, Tenant>();

  async save(tenant: Tenant): Promise<void> {
    this.tenants.set(tenant.getId().toString(), tenant);
  }

  async findById(id: TenantId): Promise<Tenant | null> {
    return this.tenants.get(id.toString()) ?? null;
  }

  async existsBySlug(slug: TenantSlug): Promise<boolean> {
    for (const tenant of this.tenants.values()) {
      if (tenant.getSlug().equals(slug)) {
        return true;
      }
    }

    return false;
  }
}
