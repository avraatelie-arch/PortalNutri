import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TenantStatus } from '../../domain/value-objects/tenant-status.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreateTenantCommand } from '../create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../create-tenant/create-tenant.handler.js';
import { TenantNotFoundError } from '../errors/tenant-not-found.error.js';
import { InMemoryTenantRepository } from '../../infrastructure/repositories/in-memory-tenant.repository.js';
import { DeactivateTenantCommand } from './deactivate-tenant.command.js';
import { DeactivateTenantHandler } from './deactivate-tenant.handler.js';

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

describe('DeactivateTenantHandler', () => {
  it('deactivates an active tenant', async () => {
    const { repository, created } = await seedTenant();
    const handler = new DeactivateTenantHandler(repository, noopEventDispatcher);

    const result = await handler.execute(
      new DeactivateTenantCommand(created.id),
    );

    assert.equal(result.status, TenantStatus.Inactive);
  });

  it('dispatches TenantDeactivated only when state changes', async () => {
    const { repository, created } = await seedTenant();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new DeactivateTenantHandler(repository, eventDispatcher);

    await handler.execute(new DeactivateTenantCommand(created.id));

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'TenantDeactivated',
    );

    await handler.execute(new DeactivateTenantCommand(created.id));

    assert.equal(eventDispatcher.dispatched.length, 1);
  });

  it('is idempotent when tenant is already inactive', async () => {
    const { repository, created } = await seedTenant();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new DeactivateTenantHandler(repository, eventDispatcher);

    await handler.execute(new DeactivateTenantCommand(created.id));

    const result = await handler.execute(
      new DeactivateTenantCommand(created.id),
    );

    assert.equal(result.status, TenantStatus.Inactive);
    assert.equal(eventDispatcher.dispatched.length, 1);
  });

  it('throws TenantNotFoundError when tenant does not exist', async () => {
    const handler = new DeactivateTenantHandler(
      new InMemoryTenantRepository(),
      noopEventDispatcher,
    );

    await assert.rejects(
      () => handler.execute(new DeactivateTenantCommand(UNKNOWN_TENANT_ID)),
      TenantNotFoundError,
    );
  });
});
