import type { Tenant } from '../aggregates/tenant.aggregate.js';
import type { TenantId } from '../value-objects/tenant-id.js';
import type { TenantSlug } from '../value-objects/tenant-slug.js';

export interface TenantRepository {
  save(tenant: Tenant): Promise<void>;
  findById(id: TenantId): Promise<Tenant | null>;
  existsBySlug(slug: TenantSlug): Promise<boolean>;
}
