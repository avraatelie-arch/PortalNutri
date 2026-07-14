import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import { ActivateTenantCommand } from '../../application/activate-tenant/activate-tenant.command.js';
import { ActivateTenantHandler } from '../../application/activate-tenant/activate-tenant.handler.js';
import { CreateTenantCommand } from '../../application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../application/create-tenant/create-tenant.handler.js';
import { DeactivateTenantCommand } from '../../application/deactivate-tenant/deactivate-tenant.command.js';
import { DeactivateTenantHandler } from '../../application/deactivate-tenant/deactivate-tenant.handler.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import { TenantSlug } from '../../domain/value-objects/tenant-slug.js';
import { TenantStatus } from '../../domain/value-objects/tenant-status.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { PrismaTenantRepository } from './prisma-tenant.repository.js';

requireDatabaseUrl();

const prisma = new PrismaClient();
const repository = new PrismaTenantRepository(prisma);

async function resetTenants() {
  await prisma.membership.deleteMany();
  await prisma.tenant.deleteMany();
}

describe('PrismaTenantRepository (integration)', () => {
  before(async () => {
    await resetTenants();
  });

  after(async () => {
    await resetTenants();
    await prisma.$disconnect();
  });

  it('persists and finds a tenant by id', async () => {
    const createHandler = new CreateTenantHandler(repository, noopEventDispatcher);

    const created = await createHandler.execute(
      new CreateTenantCommand({
        name: 'Portal Nutri Clinic',
        slug: 'portal-nutri-clinic',
      }),
    );

    const found = await repository.findById(TenantId.create(created.id));

    assert.ok(found);
    assert.equal(found.getName().toString(), 'Portal Nutri Clinic');
    assert.equal(found.getSlug().toString(), 'portal-nutri-clinic');
    assert.equal(found.getStatus(), TenantStatus.Active);
  });

  it('reports slug existence', async () => {
    const createHandler = new CreateTenantHandler(repository, noopEventDispatcher);

    await createHandler.execute(
      new CreateTenantCommand({
        name: 'Portal Nutri Clinic',
        slug: 'slug-exists',
      }),
    );

    assert.equal(
      await repository.existsBySlug(TenantSlug.create('slug-exists')),
      true,
    );
    assert.equal(
      await repository.existsBySlug(TenantSlug.create('missing-slug')),
      false,
    );
  });

  it('persists deactivation status', async () => {
    const createHandler = new CreateTenantHandler(repository, noopEventDispatcher);
    const deactivateHandler = new DeactivateTenantHandler(
      repository,
      noopEventDispatcher,
    );

    const created = await createHandler.execute(
      new CreateTenantCommand({
        name: 'Inactive Clinic',
        slug: 'inactive-clinic',
      }),
    );

    await deactivateHandler.execute(new DeactivateTenantCommand(created.id));

    const found = await repository.findById(TenantId.create(created.id));

    assert.ok(found);
    assert.equal(found.getStatus(), TenantStatus.Inactive);
  });

  it('persists activation after deactivation', async () => {
    const createHandler = new CreateTenantHandler(repository, noopEventDispatcher);
    const deactivateHandler = new DeactivateTenantHandler(
      repository,
      noopEventDispatcher,
    );
    const activateHandler = new ActivateTenantHandler(
      repository,
      noopEventDispatcher,
    );

    const created = await createHandler.execute(
      new CreateTenantCommand({
        name: 'Reactivated Clinic',
        slug: 'reactivated-clinic',
      }),
    );

    await deactivateHandler.execute(new DeactivateTenantCommand(created.id));
    await activateHandler.execute(new ActivateTenantCommand(created.id));

    const found = await repository.findById(TenantId.create(created.id));

    assert.ok(found);
    assert.equal(found.getStatus(), TenantStatus.Active);
  });

  it('returns null when tenant does not exist', async () => {
    const found = await repository.findById(
      TenantId.create('550e8400-e29b-41d4-a716-446655440099'),
    );

    assert.equal(found, null);
  });
});
