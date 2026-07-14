import type { Tenant as TenantRecord } from '@prisma/client';
import { TenantStatus as PrismaTenantStatus } from '@prisma/client';
import { Tenant } from '../../domain/aggregates/tenant.aggregate.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import { TenantName } from '../../domain/value-objects/tenant-name.js';
import { TenantSlug } from '../../domain/value-objects/tenant-slug.js';
import { TenantStatus } from '../../domain/value-objects/tenant-status.js';

export type TenantPersistenceInput = {
  id: string;
  name: string;
  slug: string;
  status: PrismaTenantStatus;
  createdAt: Date;
  updatedAt: Date;
};

export function toPersistence(tenant: Tenant): TenantPersistenceInput {
  return {
    id: tenant.getId().toString(),
    name: tenant.getName().toString(),
    slug: tenant.getSlug().toString(),
    status: toPrismaTenantStatus(tenant.getStatus()),
    createdAt: tenant.getCreatedAt(),
    updatedAt: tenant.getUpdatedAt(),
  };
}

export function toDomain(record: TenantRecord): Tenant {
  return Tenant.reconstitute({
    id: TenantId.create(record.id),
    name: TenantName.create(record.name),
    slug: TenantSlug.create(record.slug),
    status: toDomainTenantStatus(record.status),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

function toPrismaTenantStatus(status: TenantStatus): PrismaTenantStatus {
  return status as PrismaTenantStatus;
}

function toDomainTenantStatus(status: PrismaTenantStatus): TenantStatus {
  return status as TenantStatus;
}
