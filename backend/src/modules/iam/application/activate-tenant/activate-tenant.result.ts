import type { Tenant } from '../../domain/aggregates/tenant.aggregate.js';
import type { TenantStatus } from '../../domain/value-objects/tenant-status.js';

export interface ActivateTenantResult {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

export function toActivateTenantResult(tenant: Tenant): ActivateTenantResult {
  return {
    id: tenant.getId().toString(),
    name: tenant.getName().toString(),
    slug: tenant.getSlug().toString(),
    status: tenant.getStatus(),
    createdAt: tenant.getCreatedAt().toISOString(),
    updatedAt: tenant.getUpdatedAt().toISOString(),
  };
}
