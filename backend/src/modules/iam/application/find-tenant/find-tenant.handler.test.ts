import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TenantStatus } from '../../domain/value-objects/tenant-status.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreateTenantCommand } from '../create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../create-tenant/create-tenant.handler.js';
import { TenantNotFoundError } from '../errors/tenant-not-found.error.js';
import { InMemoryTenantRepository } from '../../infrastructure/repositories/in-memory-tenant.repository.js';
import { FindTenantHandler } from './find-tenant.handler.js';
import { FindTenantQuery } from './find-tenant.query.js';

const UNKNOWN_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';

async function seedTenant(repository = new InMemoryTenantRepository()) {
  const createHandler = new CreateTenantHandler(repository, noopEventDispatcher);
  const created = await createHandler.execute(
    new CreateTenantCommand({
      name: 'Portal Nutri Clinic',
      slug: 'portal-nutri-clinic',
    }),
  );

  return { repository, created };
}

describe('FindTenantHandler', () => {
  it('finds an existing tenant by id', async () => {
    const { repository, created } = await seedTenant();
    const handler = new FindTenantHandler(repository);

    const result = await handler.execute(new FindTenantQuery(created.id));

    assert.equal(result.id, created.id);
    assert.equal(result.name, 'Portal Nutri Clinic');
    assert.equal(result.slug, 'portal-nutri-clinic');
    assert.equal(result.status, TenantStatus.Active);
  });

  it('throws TenantNotFoundError when tenant does not exist', async () => {
    const handler = new FindTenantHandler(new InMemoryTenantRepository());

    await assert.rejects(
      () => handler.execute(new FindTenantQuery(UNKNOWN_TENANT_ID)),
      TenantNotFoundError,
    );
  });
});
