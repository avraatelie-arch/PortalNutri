import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreateTenantCommand } from '../create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../create-tenant/create-tenant.handler.js';
import { CreatePermissionCommand } from '../create-permission/create-permission.command.js';
import { CreatePermissionHandler } from '../create-permission/create-permission.handler.js';
import { PermissionNotFoundError } from '../errors/permission-not-found.error.js';
import { InMemoryPermissionRepository } from '../../infrastructure/repositories/in-memory-permission.repository.js';
import { InMemoryTenantRepository } from '../../infrastructure/repositories/in-memory-tenant.repository.js';
import { FindPermissionHandler } from './find-permission.handler.js';
import { FindPermissionQuery } from './find-permission.query.js';

const UNKNOWN_PERMISSION_ID = '550e8400-e29b-41d4-a716-446655440099';

async function seedPermission() {
  const tenantRepository = new InMemoryTenantRepository();
  const permissionRepository = new InMemoryPermissionRepository();

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Find Permission Clinic',
      slug: 'find-permission-clinic',
    }),
  );

  const permission = await new CreatePermissionHandler(
    permissionRepository,
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreatePermissionCommand({
      tenantId: tenant.id,
      name: 'Manage Patients',
    }),
  );

  return { permissionRepository, permission };
}

describe('FindPermissionHandler', () => {
  it('finds a permission by id', async () => {
    const { permissionRepository, permission } = await seedPermission();
    const handler = new FindPermissionHandler(permissionRepository);

    const result = await handler.execute(new FindPermissionQuery(permission.id));

    assert.equal(result.id, permission.id);
    assert.equal(result.tenantId, permission.tenantId);
    assert.equal(result.name, 'Manage Patients');
  });

  it('throws PermissionNotFoundError when permission does not exist', async () => {
    const handler = new FindPermissionHandler(new InMemoryPermissionRepository());

    await assert.rejects(
      () => handler.execute(new FindPermissionQuery(UNKNOWN_PERMISSION_ID)),
      PermissionNotFoundError,
    );
  });
});
