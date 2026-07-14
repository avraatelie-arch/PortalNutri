import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TenantStatus } from '../../domain/value-objects/tenant-status.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreateTenantCommand } from '../create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../create-tenant/create-tenant.handler.js';
import { DeactivateTenantCommand } from '../deactivate-tenant/deactivate-tenant.command.js';
import { DeactivateTenantHandler } from '../deactivate-tenant/deactivate-tenant.handler.js';
import { TenantNotFoundError } from '../errors/tenant-not-found.error.js';
import { InMemoryTenantRepository } from '../../infrastructure/repositories/in-memory-tenant.repository.js';
import { ActivateTenantCommand } from './activate-tenant.command.js';
import { ActivateTenantHandler } from './activate-tenant.handler.js';

const UNKNOWN_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';

async function seedInactiveTenant(repository = new InMemoryTenantRepository()) {
  const createHandler = new CreateTenantHandler(repository, noopEventDispatcher);
  const deactivateHandler = new DeactivateTenantHandler(
    repository,
    noopEventDispatcher,
  );
  const created = await createHandler.execute(
    new CreateTenantCommand({
      name: 'Portal Nutri Clinic',
      slug: 'portal-nutri-clinic',
    }),
  );

  await deactivateHandler.execute(new DeactivateTenantCommand(created.id));

  return { repository, created };
}

describe('ActivateTenantHandler', () => {
  it('activates an inactive tenant', async () => {
    const { repository, created } = await seedInactiveTenant();
    const handler = new ActivateTenantHandler(repository, noopEventDispatcher);

    const result = await handler.execute(new ActivateTenantCommand(created.id));

    assert.equal(result.status, TenantStatus.Active);
  });

  it('dispatches TenantActivated only when state changes', async () => {
    const { repository, created } = await seedInactiveTenant();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new ActivateTenantHandler(repository, eventDispatcher);

    await handler.execute(new ActivateTenantCommand(created.id));

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'TenantActivated',
    );

    await handler.execute(new ActivateTenantCommand(created.id));

    assert.equal(eventDispatcher.dispatched.length, 1);
  });

  it('is idempotent when tenant is already active', async () => {
    const repository = new InMemoryTenantRepository();
    const createHandler = new CreateTenantHandler(repository, noopEventDispatcher);
    const created = await createHandler.execute(
      new CreateTenantCommand({
        name: 'Portal Nutri Clinic',
        slug: 'portal-nutri-clinic',
      }),
    );
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new ActivateTenantHandler(repository, eventDispatcher);

    const result = await handler.execute(new ActivateTenantCommand(created.id));

    assert.equal(result.status, TenantStatus.Active);
    assert.equal(eventDispatcher.dispatched.length, 0);
  });

  it('throws TenantNotFoundError when tenant does not exist', async () => {
    const handler = new ActivateTenantHandler(
      new InMemoryTenantRepository(),
      noopEventDispatcher,
    );

    await assert.rejects(
      () => handler.execute(new ActivateTenantCommand(UNKNOWN_TENANT_ID)),
      TenantNotFoundError,
    );
  });
});
