import type { Role as RoleRecord } from '@prisma/client';
import { Role } from '../../domain/aggregates/role.aggregate.js';
import { RoleId } from '../../domain/value-objects/role-id.js';
import { RoleName } from '../../domain/value-objects/role-name.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import { normalizeRoleNameForPersistence } from './role-name-normalizer.js';

export type RolePersistenceInput = {
  id: string;
  tenantId: string;
  name: string;
  normalizedName: string;
  createdAt: Date;
};

export function toPersistence(role: Role): RolePersistenceInput {
  const name = role.getName().toString();

  return {
    id: role.getId().toString(),
    tenantId: role.getTenantId().toString(),
    name,
    normalizedName: normalizeRoleNameForPersistence(name),
    createdAt: role.getCreatedAt(),
  };
}

export function toDomain(record: RoleRecord): Role {
  return Role.reconstitute({
    id: RoleId.create(record.id),
    tenantId: TenantId.create(record.tenantId),
    name: RoleName.create(record.name),
    createdAt: record.createdAt,
  });
}
