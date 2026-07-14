import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import { CreateTenantCommand } from '../../application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../application/create-tenant/create-tenant.handler.js';
import { Permission } from '../../domain/aggregates/permission.aggregate.js';
import { PermissionId } from '../../domain/value-objects/permission-id.js';
import { PermissionName } from '../../domain/value-objects/permission-name.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { PrismaPermissionRepository } from './prisma-permission.repository.js';
import { PrismaTenantRepository } from './prisma-tenant.repository.js';

requireDatabaseUrl();

const prisma = new PrismaClient();
const permissionRepository = new PrismaPermissionRepository(prisma);
const tenantRepository = new PrismaTenantRepository(prisma);

async function resetPermissions() {
  await prisma.permissionAssignment.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.roleAssignment.deleteMany();
  await prisma.role.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.session.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.person.deleteMany();
  await prisma.tenant.deleteMany();
}

let seedCounter = 0;

describe('PrismaPermissionRepository (integration)', () => {
  before(async () => {
    await resetPermissions();
  });

  after(async () => {
    await resetPermissions();
    await prisma.$disconnect();
  });

  it('persists and finds a tenant-scoped permission by id', async () => {
    seedCounter += 1;
    const suffix = seedCounter;

    const tenant = await new CreateTenantHandler(
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: `Permission Persistence Clinic ${suffix}`,
        slug: `permission-persistence-clinic-${suffix}`,
      }),
    );

    const permission = Permission.create({
      tenantId: TenantId.create(tenant.id),
      name: PermissionName.create('Manage Patients'),
    });

    await permissionRepository.save(permission);

    const found = await permissionRepository.findById(permission.getId());

    assert.ok(found);
    assert.equal(found.getTenantId().toString(), tenant.id);
    assert.equal(found.getName().toString(), 'Manage Patients');
  });

  it('detects duplicate normalized names within the same tenant', async () => {
    seedCounter += 1;
    const suffix = seedCounter;

    const tenant = await new CreateTenantHandler(
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: `Permission Uniqueness Clinic ${suffix}`,
        slug: `permission-uniqueness-clinic-${suffix}`,
      }),
    );

    const permission = Permission.create({
      tenantId: TenantId.create(tenant.id),
      name: PermissionName.create('Manage Patients'),
    });

    await permissionRepository.save(permission);

    const exists = await permissionRepository.existsByTenantAndNormalizedName(
      TenantId.create(tenant.id),
      PermissionName.create('  manage   patients  ').normalizedValue,
    );

    assert.equal(exists, true);
  });

  it('returns null when permission does not exist', async () => {
    const found = await permissionRepository.findById(
      PermissionId.create('550e8400-e29b-41d4-a716-446655440099'),
    );

    assert.equal(found, null);
  });
});
