import type { Tenant } from '../../domain/aggregates/tenant.aggregate.js';
import type { TenantStatus } from '../../domain/value-objects/tenant-status.js';

export interface CreateTenantResult {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  createdAt: string;
  updatedAt: string;
}

export class CreateTenantResponse implements CreateTenantResult {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly slug: string,
    readonly status: TenantStatus,
    readonly createdAt: string,
    readonly updatedAt: string,
  ) {}

  static from(tenant: Tenant): CreateTenantResponse {
    return new CreateTenantResponse(
      tenant.getId().toString(),
      tenant.getName().toString(),
      tenant.getSlug().toString(),
      tenant.getStatus(),
      tenant.getCreatedAt().toISOString(),
      tenant.getUpdatedAt().toISOString(),
    );
  }
}
