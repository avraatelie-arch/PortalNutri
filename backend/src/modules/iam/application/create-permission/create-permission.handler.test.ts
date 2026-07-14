import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreateTenantCommand } from '../create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../create-tenant/create-tenant.handler.js';
import { PermissionNameAlreadyExistsError } from '../errors/permission-name-already-exists.error.js';
import { TenantInactiveError } from '../errors/tenant-inactive.error.js';
import { DeactivateTenantCommand } from '../deactivate-tenant/deactivate-tenant.command.js';
import { DeactivateTenantHandler } from '../deactivate-tenant/deactivate-tenant.handler.js';
import { InMemoryPermissionRepository } from '../../infrastructure/repositories/in-memory-permission.repository.js';
import { InMemoryTenantRepository } from '../../infrastructure/repositories/in-memory-tenant.repository.js';
import { CreatePermissionCommand } from './create-permission.command.js';
import { CreatePermissionHandler } from './create-permission.handler.js';

async function seedTenant(repository = new InMemoryTenantRepository()) {
  const created = await new CreateTenantHandler(
    repository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Portal Nutri Clinic',
      slug: 'portal-nutri-clinic',
    }),
  );

  return { repository, created };
}

describe('CreatePermissionHandler', () => {
  it('creates a tenant-scoped permission', async () => {
    const { repository: tenantRepository, created: tenant } = await seedTenant();
    const permissionRepository = new InMemoryPermissionRepository();
    const handler = new CreatePermissionHandler(
      permissionRepository,
      tenantRepository,
      noopEventDispatcher,
    );

    const response = await handler.execute(
      new CreatePermissionCommand({
        tenantId: tenant.id,
        name: 'Manage Patients',
      }),
    );

    assert.equal(response.tenantId, tenant.id);
    assert.equal(response.name, 'Manage Patients');
  });

  it('rejects duplicate permission names within the same tenant', async () => {
    const { repository: tenantRepository, created: tenant } = await seedTenant();
    const permissionRepository = new InMemoryPermissionRepository();
    const handler = new CreatePermissionHandler(
      permissionRepository,
      tenantRepository,
      noopEventDispatcher,
    );

    await handler.execute(
      new CreatePermissionCommand({
        tenantId: tenant.id,
        name: 'Manage Patients',
      }),
    );

    await assert.rejects(
      () =>
        handler.execute(
          new CreatePermissionCommand({
            tenantId: tenant.id,
            name: '  manage   patients  ',
          }),
        ),
      PermissionNameAlreadyExistsError,
    );
  });

  it('allows the same permission name in different tenants', async () => {
    const tenantRepository = new InMemoryTenantRepository();
    const tenantA = await seedTenant(tenantRepository);
    const tenantB = await new CreateTenantHandler(
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: 'Second Clinic',
        slug: 'second-clinic',
      }),
    );
    const permissionRepository = new InMemoryPermissionRepository();
    const handler = new CreatePermissionHandler(
      permissionRepository,
      tenantRepository,
      noopEventDispatcher,
    );

    await handler.execute(
      new CreatePermissionCommand({
        tenantId: tenantA.created.id,
        name: 'Manage Patients',
      }),
    );

    const second = await handler.execute(
      new CreatePermissionCommand({
        tenantId: tenantB.id,
        name: 'Manage Patients',
      }),
    );

    assert.equal(second.name, 'Manage Patients');
  });

  it('dispatches PermissionCreated after persistence', async () => {
    const { repository: tenantRepository, created: tenant } = await seedTenant();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new CreatePermissionHandler(
      new InMemoryPermissionRepository(),
      tenantRepository,
      eventDispatcher,
    );

    await handler.execute(
      new CreatePermissionCommand({
        tenantId: tenant.id,
        name: 'Manage Patients',
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'PermissionCreated',
    );
  });

  it('rejects permission creation for inactive tenant', async () => {
    const { repository: tenantRepository, created: tenant } = await seedTenant();
    await new DeactivateTenantHandler(tenantRepository, noopEventDispatcher).execute(
      new DeactivateTenantCommand(tenant.id),
    );

    const handler = new CreatePermissionHandler(
      new InMemoryPermissionRepository(),
      tenantRepository,
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new CreatePermissionCommand({
            tenantId: tenant.id,
            name: 'Manage Patients',
          }),
        ),
      TenantInactiveError,
    );
  });
});
