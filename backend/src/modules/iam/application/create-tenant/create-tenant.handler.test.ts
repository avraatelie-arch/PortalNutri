import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TenantStatus } from '../../domain/value-objects/tenant-status.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { TenantSlugAlreadyExistsError } from '../errors/tenant-slug-already-exists.error.js';
import { TenantValidationError } from '../errors/tenant-validation.error.js';
import { InMemoryTenantRepository } from '../../infrastructure/repositories/in-memory-tenant.repository.js';
import { CreateTenantCommand } from './create-tenant.command.js';
import { CreateTenantHandler } from './create-tenant.handler.js';

function createHandler(repository = new InMemoryTenantRepository()) {
  return new CreateTenantHandler(repository, noopEventDispatcher);
}

describe('CreateTenantHandler', () => {
  it('creates a valid tenant', async () => {
    const handler = createHandler();

    const response = await handler.execute(
      new CreateTenantCommand({
        name: 'Portal Nutri Clinic',
        slug: 'portal-nutri-clinic',
      }),
    );

    assert.equal(response.name, 'Portal Nutri Clinic');
    assert.equal(response.slug, 'portal-nutri-clinic');
    assert.equal(response.status, TenantStatus.Active);
    assert.match(response.id, /^[0-9a-f-]{36}$/i);
  });

  it('persists the created tenant in repository', async () => {
    const repository = new InMemoryTenantRepository();
    const handler = createHandler(repository);

    const response = await handler.execute(
      new CreateTenantCommand({
        name: 'Portal Nutri Clinic',
        slug: 'portal-nutri-clinic',
      }),
    );

    const found = await repository.findById(TenantId.create(response.id));

    assert.ok(found);
    assert.equal(found.getSlug().toString(), 'portal-nutri-clinic');
  });

  it('rejects duplicate slug', async () => {
    const handler = createHandler();

    await handler.execute(
      new CreateTenantCommand({
        name: 'Portal Nutri Clinic',
        slug: 'portal-nutri-clinic',
      }),
    );

    await assert.rejects(
      () =>
        handler.execute(
          new CreateTenantCommand({
            name: 'Another Clinic',
            slug: 'portal-nutri-clinic',
          }),
        ),
      TenantSlugAlreadyExistsError,
    );
  });

  it('dispatches TenantCreated after persistence', async () => {
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new CreateTenantHandler(
      new InMemoryTenantRepository(),
      eventDispatcher,
    );

    await handler.execute(
      new CreateTenantCommand({
        name: 'Portal Nutri Clinic',
        slug: 'portal-nutri-clinic',
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'TenantCreated',
    );
  });

  it('rejects invalid slug from domain validation', async () => {
    const handler = createHandler();

    await assert.rejects(
      () =>
        handler.execute(
          new CreateTenantCommand({
            name: 'Portal Nutri Clinic',
            slug: 'invalid slug',
          }),
        ),
      TenantValidationError,
    );
  });
});
