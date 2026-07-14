import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import { CreateTenantCommand } from '../../application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../application/create-tenant/create-tenant.handler.js';
import { CreateRoleCommand } from '../../application/create-role/create-role.command.js';
import { CreateRoleHandler } from '../../application/create-role/create-role.handler.js';
import { RoleId } from '../../domain/value-objects/role-id.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { normalizeRoleNameForPersistence } from '../prisma/role-name-normalizer.js';
import { PrismaRoleRepository } from './prisma-role.repository.js';
import { PrismaTenantRepository } from './prisma-tenant.repository.js';

requireDatabaseUrl();

const prisma = new PrismaClient();
const roleRepository = new PrismaRoleRepository(prisma);
const tenantRepository = new PrismaTenantRepository(prisma);

async function resetRoles() {
  await prisma.roleAssignment.deleteMany();
  await prisma.role.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.session.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.person.deleteMany();
  await prisma.tenant.deleteMany();
}

describe('PrismaRoleRepository (integration)', () => {
  before(async () => {
    await resetRoles();
  });

  after(async () => {
    await resetRoles();
    await prisma.$disconnect();
  });

  it('persists and finds a tenant-scoped role by id', async () => {
    const tenant = await new CreateTenantHandler(
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: 'Role Persistence Clinic',
        slug: 'role-persistence-clinic',
      }),
    );

    const created = await new CreateRoleHandler(
      roleRepository,
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateRoleCommand({
        tenantId: tenant.id,
        name: 'Clinic Admin',
      }),
    );

    const found = await roleRepository.findById(RoleId.create(created.id));

    assert.ok(found);
    assert.equal(found.getTenantId().toString(), tenant.id);
    assert.equal(found.getName().toString(), 'Clinic Admin');
  });

  it('detects duplicate normalized names within the same tenant', async () => {
    const tenant = await new CreateTenantHandler(
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: 'Role Uniqueness Clinic',
        slug: 'role-uniqueness-clinic',
      }),
    );

    await new CreateRoleHandler(
      roleRepository,
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateRoleCommand({
        tenantId: tenant.id,
        name: 'Clinic Admin',
      }),
    );

    const exists = await roleRepository.existsByTenantAndNormalizedName(
      TenantId.create(tenant.id),
      normalizeRoleNameForPersistence('  clinic   admin  '),
    );

    assert.equal(exists, true);
  });

  it('returns null when role does not exist', async () => {
    const found = await roleRepository.findById(
      RoleId.create('550e8400-e29b-41d4-a716-446655440099'),
    );

    assert.equal(found, null);
  });
});
