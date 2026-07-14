import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { PermissionAssignmentStatus } from '../../domain/value-objects/permission-assignment-status.js';
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
import { FindPermissionAssignmentHandler } from './find-permission-assignment.handler.js';
import { FindPermissionAssignmentQuery } from './find-permission-assignment.query.js';

const UNKNOWN_ASSIGNMENT_ID = '550e8400-e29b-41d4-a716-446655440099';

async function seedAssignment() {
  const tenantRepository = new InMemoryTenantRepository();
  const roleRepository = new InMemoryRoleRepository();
  const permissionRepository = new InMemoryPermissionRepository();
  const assignmentRepository = new InMemoryPermissionAssignmentRepository();

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Find Permission Assignment Clinic',
      slug: 'find-permission-assignment-clinic',
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

  return { assignmentRepository, assignment };
}

describe('FindPermissionAssignmentHandler', () => {
  it('finds a permission assignment by id', async () => {
    const { assignmentRepository, assignment } = await seedAssignment();
    const handler = new FindPermissionAssignmentHandler(assignmentRepository);

    const result = await handler.execute(
      new FindPermissionAssignmentQuery(assignment.id),
    );

    assert.equal(result.id, assignment.id);
    assert.equal(result.roleId, assignment.roleId);
    assert.equal(result.permissionId, assignment.permissionId);
    assert.equal(result.status, PermissionAssignmentStatus.Active);
  });

  it('throws PermissionAssignmentNotFoundError when assignment does not exist', async () => {
    const handler = new FindPermissionAssignmentHandler(
      new InMemoryPermissionAssignmentRepository(),
    );

    await assert.rejects(
      () =>
        handler.execute(new FindPermissionAssignmentQuery(UNKNOWN_ASSIGNMENT_ID)),
      PermissionAssignmentNotFoundError,
    );
  });
});
