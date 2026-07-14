import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreateTenantCommand } from '../create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../create-tenant/create-tenant.handler.js';
import { CreateRoleCommand } from '../create-role/create-role.command.js';
import { CreateRoleHandler } from '../create-role/create-role.handler.js';
import { RoleNotFoundError } from '../errors/role-not-found.error.js';
import { InMemoryRoleRepository } from '../../infrastructure/repositories/in-memory-role.repository.js';
import { InMemoryTenantRepository } from '../../infrastructure/repositories/in-memory-tenant.repository.js';
import { FindRoleHandler } from './find-role.handler.js';
import { FindRoleQuery } from './find-role.query.js';

const UNKNOWN_ROLE_ID = '550e8400-e29b-41d4-a716-446655440099';

async function seedRole() {
  const tenantRepository = new InMemoryTenantRepository();
  const roleRepository = new InMemoryRoleRepository();

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Find Role Clinic',
      slug: 'find-role-clinic',
    }),
  );

  const role = await new CreateRoleHandler(
    roleRepository,
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateRoleCommand({
      tenantId: tenant.id,
      name: 'Clinic Admin',
    }),
  );

  return { roleRepository, role };
}

describe('FindRoleHandler', () => {
  it('finds a role by id', async () => {
    const { roleRepository, role } = await seedRole();
    const handler = new FindRoleHandler(roleRepository);

    const result = await handler.execute(new FindRoleQuery(role.id));

    assert.equal(result.id, role.id);
    assert.equal(result.tenantId, role.tenantId);
    assert.equal(result.name, 'Clinic Admin');
  });

  it('throws RoleNotFoundError when role does not exist', async () => {
    const handler = new FindRoleHandler(new InMemoryRoleRepository());

    await assert.rejects(
      () => handler.execute(new FindRoleQuery(UNKNOWN_ROLE_ID)),
      RoleNotFoundError,
    );
  });
});
