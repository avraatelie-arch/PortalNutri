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
import { PermissionAssignmentAlreadyExistsError } from '../errors/permission-assignment-already-exists.error.js';
import { PermissionTenantMismatchError } from '../errors/permission-tenant-mismatch.error.js';
import { RevokePermissionCommand } from '../revoke-permission/revoke-permission.command.js';
import { RevokePermissionHandler } from '../revoke-permission/revoke-permission.handler.js';
import { InMemoryPermissionAssignmentRepository } from '../../infrastructure/repositories/in-memory-permission-assignment.repository.js';
import { InMemoryPermissionRepository } from '../../infrastructure/repositories/in-memory-permission.repository.js';
import { InMemoryRoleRepository } from '../../infrastructure/repositories/in-memory-role.repository.js';
import { InMemoryTenantRepository } from '../../infrastructure/repositories/in-memory-tenant.repository.js';
import { GrantPermissionCommand } from './grant-permission.command.js';
import { GrantPermissionHandler } from './grant-permission.handler.js';

async function seedRolePermissionContext() {
  const tenantRepository = new InMemoryTenantRepository();
  const roleRepository = new InMemoryRoleRepository();
  const permissionRepository = new InMemoryPermissionRepository();

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Portal Nutri Clinic',
      slug: 'portal-nutri-clinic',
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

  return {
    tenantRepository,
    roleRepository,
    permissionRepository,
    role,
    permission,
    tenant,
  };
}

describe('GrantPermissionHandler', () => {
  it('grants a permission to a role', async () => {
    const context = await seedRolePermissionContext();
    const handler = new GrantPermissionHandler(
      new InMemoryPermissionAssignmentRepository(),
      context.roleRepository,
      context.permissionRepository,
      noopEventDispatcher,
    );

    const response = await handler.execute(
      new GrantPermissionCommand({
        roleId: context.role.id,
        permissionId: context.permission.id,
      }),
    );

    assert.equal(response.roleId, context.role.id);
    assert.equal(response.permissionId, context.permission.id);
    assert.equal(response.status, PermissionAssignmentStatus.Active);
  });

  it('denies grant when permission tenant differs from role tenant', async () => {
    const context = await seedRolePermissionContext();
    const otherTenant = await new CreateTenantHandler(
      context.tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: 'Other Clinic',
        slug: 'other-clinic',
      }),
    );
    const foreignPermission = await new CreatePermissionHandler(
      context.permissionRepository,
      context.tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreatePermissionCommand({
        tenantId: otherTenant.id,
        name: 'Foreign Permission',
      }),
    );
    const handler = new GrantPermissionHandler(
      new InMemoryPermissionAssignmentRepository(),
      context.roleRepository,
      context.permissionRepository,
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new GrantPermissionCommand({
            roleId: context.role.id,
            permissionId: foreignPermission.id,
          }),
        ),
      PermissionTenantMismatchError,
    );
  });

  it('reactivates a removed assignment', async () => {
    const context = await seedRolePermissionContext();
    const assignmentRepository = new InMemoryPermissionAssignmentRepository();
    const grantHandler = new GrantPermissionHandler(
      assignmentRepository,
      context.roleRepository,
      context.permissionRepository,
      noopEventDispatcher,
    );
    const created = await grantHandler.execute(
      new GrantPermissionCommand({
        roleId: context.role.id,
        permissionId: context.permission.id,
      }),
    );

    await new RevokePermissionHandler(
      assignmentRepository,
      context.roleRepository,
      noopEventDispatcher,
    ).execute(
      new RevokePermissionCommand({
        roleId: context.role.id,
        permissionId: context.permission.id,
      }),
    );

    const reactivated = await grantHandler.execute(
      new GrantPermissionCommand({
        roleId: context.role.id,
        permissionId: context.permission.id,
      }),
    );

    assert.equal(reactivated.id, created.id);
    assert.equal(reactivated.status, PermissionAssignmentStatus.Active);
  });

  it('rejects duplicate active assignments', async () => {
    const context = await seedRolePermissionContext();
    const assignmentRepository = new InMemoryPermissionAssignmentRepository();
    const handler = new GrantPermissionHandler(
      assignmentRepository,
      context.roleRepository,
      context.permissionRepository,
      noopEventDispatcher,
    );

    await handler.execute(
      new GrantPermissionCommand({
        roleId: context.role.id,
        permissionId: context.permission.id,
      }),
    );

    await assert.rejects(
      () =>
        handler.execute(
          new GrantPermissionCommand({
            roleId: context.role.id,
            permissionId: context.permission.id,
          }),
        ),
      PermissionAssignmentAlreadyExistsError,
    );
  });

  it('dispatches PermissionGranted with explicit tenantId', async () => {
    const context = await seedRolePermissionContext();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new GrantPermissionHandler(
      new InMemoryPermissionAssignmentRepository(),
      context.roleRepository,
      context.permissionRepository,
      eventDispatcher,
    );

    await handler.execute(
      new GrantPermissionCommand({
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

    assert.equal(event.eventName, 'PermissionGranted');
    assert.equal(event.tenantId, context.tenant.id);
    assert.equal(event.roleId, context.role.id);
    assert.equal(event.permissionId, context.permission.id);
  });
});
