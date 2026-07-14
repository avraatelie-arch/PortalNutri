import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreateTenantCommand } from '../create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../create-tenant/create-tenant.handler.js';
import { RoleNameAlreadyExistsError } from '../errors/role-name-already-exists.error.js';
import { TenantInactiveError } from '../errors/tenant-inactive.error.js';
import { DeactivateTenantCommand } from '../deactivate-tenant/deactivate-tenant.command.js';
import { DeactivateTenantHandler } from '../deactivate-tenant/deactivate-tenant.handler.js';
import { InMemoryRoleRepository } from '../../infrastructure/repositories/in-memory-role.repository.js';
import { InMemoryTenantRepository } from '../../infrastructure/repositories/in-memory-tenant.repository.js';
import { CreateRoleCommand } from './create-role.command.js';
import { CreateRoleHandler } from './create-role.handler.js';

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

describe('CreateRoleHandler', () => {
  it('creates a tenant-scoped role', async () => {
    const { repository: tenantRepository, created: tenant } = await seedTenant();
    const roleRepository = new InMemoryRoleRepository();
    const handler = new CreateRoleHandler(
      roleRepository,
      tenantRepository,
      noopEventDispatcher,
    );

    const response = await handler.execute(
      new CreateRoleCommand({
        tenantId: tenant.id,
        name: 'Clinic Admin',
      }),
    );

    assert.equal(response.tenantId, tenant.id);
    assert.equal(response.name, 'Clinic Admin');
  });

  it('rejects duplicate role names within the same tenant', async () => {
    const { repository: tenantRepository, created: tenant } = await seedTenant();
    const roleRepository = new InMemoryRoleRepository();
    const handler = new CreateRoleHandler(
      roleRepository,
      tenantRepository,
      noopEventDispatcher,
    );

    await handler.execute(
      new CreateRoleCommand({ tenantId: tenant.id, name: 'Clinic Admin' }),
    );

    await assert.rejects(
      () =>
        handler.execute(
          new CreateRoleCommand({ tenantId: tenant.id, name: '  clinic   admin  ' }),
        ),
      RoleNameAlreadyExistsError,
    );
  });

  it('allows the same role name in different tenants', async () => {
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
    const roleRepository = new InMemoryRoleRepository();
    const handler = new CreateRoleHandler(
      roleRepository,
      tenantRepository,
      noopEventDispatcher,
    );

    await handler.execute(
      new CreateRoleCommand({
        tenantId: tenantA.created.id,
        name: 'Clinic Admin',
      }),
    );

    const second = await handler.execute(
      new CreateRoleCommand({
        tenantId: tenantB.id,
        name: 'Clinic Admin',
      }),
    );

    assert.equal(second.name, 'Clinic Admin');
  });

  it('dispatches RoleCreated after persistence', async () => {
    const { repository: tenantRepository, created: tenant } = await seedTenant();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new CreateRoleHandler(
      new InMemoryRoleRepository(),
      tenantRepository,
      eventDispatcher,
    );

    await handler.execute(
      new CreateRoleCommand({ tenantId: tenant.id, name: 'Clinic Admin' }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'RoleCreated',
    );
  });

  it('rejects role creation for inactive tenant', async () => {
    const { repository: tenantRepository, created: tenant } = await seedTenant();
    await new DeactivateTenantHandler(tenantRepository, noopEventDispatcher).execute(
      new DeactivateTenantCommand(tenant.id),
    );

    const handler = new CreateRoleHandler(
      new InMemoryRoleRepository(),
      tenantRepository,
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new CreateRoleCommand({ tenantId: tenant.id, name: 'Clinic Admin' }),
        ),
      TenantInactiveError,
    );
  });
});
