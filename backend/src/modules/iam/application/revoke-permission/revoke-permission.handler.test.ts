import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PermissionAssignmentStatus } from '../../domain/value-objects/permission-assignment-status.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreatePermissionCommand } from '../create-permission/create-permission.command.js';
import { CreatePermissionHandler } from '../create-permission/create-permission.handler.js';
import { CreateRoleCommand } from '../create-role/create-role.command.js';
import { CreateRoleHandler } from '../create-role/create-role.handler.js';
import { CreateTenantCommand } from '../create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../create-tenant/create-tenant.handler.js';
import { GrantPermissionCommand } from '../grant-permission/grant-permission.command.js';
import { GrantPermissionHandler } from '../grant-permission/grant-permission.handler.js';
import { PermissionAssignmentNotFoundError } from '../errors/permission-assignment-not-found.error.js';
import { InMemoryPermissionAssignmentRepository } from '../../infrastructure/repositories/in-memory-permission-assignment.repository.js';
import { InMemoryPermissionRepository } from '../../infrastructure/repositories/in-memory-permission.repository.js';
import { InMemoryRoleRepository } from '../../infrastructure/repositories/in-memory-role.repository.js';
import { InMemoryTenantRepository } from '../../infrastructure/repositories/in-memory-tenant.repository.js';
import { RevokePermissionCommand } from './revoke-permission.command.js';
import { RevokePermissionHandler } from './revoke-permission.handler.js';

async function seedGrantedPermission() {
  const tenantRepository = new InMemoryTenantRepository();
  const roleRepository = new InMemoryRoleRepository();
  const permissionRepository = new InMemoryPermissionRepository();
  const assignmentRepository = new InMemoryPermissionAssignmentRepository();

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Revoke Permission Clinic',
      slug: 'revoke-permission-clinic',
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

  const assignment = await new GrantPermissionHandler(
    assignmentRepository,
    roleRepository,
    permissionRepository,
    noopEventDispatcher,
  ).execute(
    new GrantPermissionCommand({
      roleId: role.id,
      permissionId: permission.id,
    }),
  );

  return {
    assignmentRepository,
    roleRepository,
    role,
    permission,
    assignment,
    tenant,
  };
}

describe('RevokePermissionHandler', () => {
  it('logically removes an active assignment', async () => {
    const context = await seedGrantedPermission();
    const handler = new RevokePermissionHandler(
      context.assignmentRepository,
      context.roleRepository,
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new RevokePermissionCommand({
        roleId: context.role.id,
        permissionId: context.permission.id,
      }),
    );

    assert.equal(result.id, context.assignment.id);
    assert.equal(result.status, PermissionAssignmentStatus.Removed);
    assert.ok(result.removedAt);
  });

  it('is idempotent when assignment is already removed', async () => {
    const context = await seedGrantedPermission();
    const handler = new RevokePermissionHandler(
      context.assignmentRepository,
      context.roleRepository,
      noopEventDispatcher,
    );

    await handler.execute(
      new RevokePermissionCommand({
        roleId: context.role.id,
        permissionId: context.permission.id,
      }),
    );

    const result = await handler.execute(
      new RevokePermissionCommand({
        roleId: context.role.id,
        permissionId: context.permission.id,
      }),
    );

    assert.equal(result.status, PermissionAssignmentStatus.Removed);
  });

  it('throws PermissionAssignmentNotFoundError when assignment does not exist', async () => {
    const context = await seedGrantedPermission();
    const handler = new RevokePermissionHandler(
      new InMemoryPermissionAssignmentRepository(),
      context.roleRepository,
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new RevokePermissionCommand({
            roleId: context.role.id,
            permissionId: context.permission.id,
          }),
        ),
      PermissionAssignmentNotFoundError,
    );
  });

  it('dispatches PermissionRevoked with explicit tenantId', async () => {
    const context = await seedGrantedPermission();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new RevokePermissionHandler(
      context.assignmentRepository,
      context.roleRepository,
      eventDispatcher,
    );

    await handler.execute(
      new RevokePermissionCommand({
        roleId: context.role.id,
        permissionId: context.permission.id,
      }),
    );

    const event = eventDispatcher.dispatched[0]?.[0] as {
      eventName: string;
      tenantId: string;
      roleId: string;
      permissionId: string;
    };

    assert.equal(event.eventName, 'PermissionRevoked');
    assert.equal(event.tenantId, context.tenant.id);
    assert.equal(event.roleId, context.role.id);
    assert.equal(event.permissionId, context.permission.id);
  });
});
