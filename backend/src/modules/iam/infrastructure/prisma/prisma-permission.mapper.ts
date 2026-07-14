import type { Permission as PermissionRecord } from '@prisma/client';
import { Permission } from '../../domain/aggregates/permission.aggregate.js';
import { PermissionId } from '../../domain/value-objects/permission-id.js';
import { PermissionName } from '../../domain/value-objects/permission-name.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';

export type PermissionPersistenceInput = {
  id: string;
  tenantId: string;
  name: string;
  normalizedName: string;
  createdAt: Date;
};

export function toPersistence(permission: Permission): PermissionPersistenceInput {
  const name = permission.getName();

  return {
    id: permission.getId().toString(),
    tenantId: permission.getTenantId().toString(),
    name: name.value,
    normalizedName: name.normalizedValue,
    createdAt: permission.getCreatedAt(),
  };
}

export function toDomain(record: PermissionRecord): Permission {
  return Permission.reconstitute({
    id: PermissionId.create(record.id),
    tenantId: TenantId.create(record.tenantId),
    name: PermissionName.create(record.name),
    createdAt: record.createdAt,
  });
}
