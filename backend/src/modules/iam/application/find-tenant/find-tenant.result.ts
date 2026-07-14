import type { Tenant } from '../../domain/aggregates/tenant.aggregate.js';
import type { TenantStatus } from '../../domain/value-objects/tenant-status.js';

export interface FindTenantResult {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

export function toFindTenantResult(tenant: Tenant): FindTenantResult {
  return {
    id: tenant.getId().toString(),
    name: tenant.getName().toString(),
    slug: tenant.getSlug().toString(),
    status: tenant.getStatus(),
    createdAt: tenant.getCreatedAt().toISOString(),
    updatedAt: tenant.getUpdatedAt().toISOString(),
  };
}
