import type { Tenant } from '../../domain/aggregates/tenant.aggregate.js';
import type { TenantStatus } from '../../domain/value-objects/tenant-status.js';

export interface DeactivateTenantResult {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

export function toDeactivateTenantResult(tenant: Tenant): DeactivateTenantResult {
  return {
    id: tenant.getId().toString(),
    name: tenant.getName().toString(),
    slug: tenant.getSlug().toString(),
    status: tenant.getStatus(),
    createdAt: tenant.getCreatedAt().toISOString(),
    updatedAt: tenant.getUpdatedAt().toISOString(),
  };
}
