import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { RoleAssignmentStatus } from '../../domain/value-objects/role-assignment-status.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { AddPersonToTenantCommand } from '../add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../add-person-to-tenant/add-person-to-tenant.handler.js';
import { AssignRoleCommand } from '../assign-role/assign-role.command.js';
import { AssignRoleHandler } from '../assign-role/assign-role.handler.js';
import { CreatePersonCommand } from '../create-person/create-person.command.js';
import { CreatePersonHandler } from '../create-person/create-person.handler.js';
import { CreateRoleCommand } from '../create-role/create-role.command.js';
import { CreateRoleHandler } from '../create-role/create-role.handler.js';
import { CreateTenantCommand } from '../create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../create-tenant/create-tenant.handler.js';
import { RoleAssignmentNotFoundError } from '../errors/role-assignment-not-found.error.js';
import { InMemoryMembershipRepository } from '../../infrastructure/repositories/in-memory-membership.repository.js';
import { InMemoryPersonRepository } from '../../infrastructure/repositories/in-memory-person.repository.js';
import { InMemoryRoleAssignmentRepository } from '../../infrastructure/repositories/in-memory-role-assignment.repository.js';
import { InMemoryRoleRepository } from '../../infrastructure/repositories/in-memory-role.repository.js';
import { InMemoryTenantRepository } from '../../infrastructure/repositories/in-memory-tenant.repository.js';
import { RemoveRoleCommand } from './remove-role.command.js';
import { RemoveRoleHandler } from './remove-role.handler.js';

async function seedAssignedRole() {
  const personRepository = new InMemoryPersonRepository();
  const tenantRepository = new InMemoryTenantRepository();
  const membershipRepository = new InMemoryMembershipRepository();
  const roleRepository = new InMemoryRoleRepository();
  const assignmentRepository = new InMemoryRoleAssignmentRepository();

  const person = await new CreatePersonHandler(
    personRepository,
    noopEventDispatcher,
  ).execute(
    new CreatePersonCommand({
      fullName: 'Maria Silva',
      email: 'maria.remove-role@example.com',
      documentType: DocumentType.PASSPORT,
      document: 'RR123456',
      birthDate: '1990-06-15',
    }),
  );

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Remove Role Clinic',
      slug: 'remove-role-clinic',
    }),
  );

  const membership = await new AddPersonToTenantHandler(
    membershipRepository,
    personRepository,
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new AddPersonToTenantCommand({
      personId: person.id,
      tenantId: tenant.id,
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

  const assignment = await new AssignRoleHandler(
    assignmentRepository,
    membershipRepository,
    roleRepository,
    noopEventDispatcher,
  ).execute(
    new AssignRoleCommand({
      membershipId: membership.id,
      roleId: role.id,
    }),
  );

  return {
    assignmentRepository,
    membershipRepository,
    membership,
    role,
    assignment,
    tenant,
  };
}

describe('RemoveRoleHandler', () => {
  it('logically removes an active assignment', async () => {
    const context = await seedAssignedRole();
    const handler = new RemoveRoleHandler(
      context.assignmentRepository,
      context.membershipRepository,
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new RemoveRoleCommand({
        membershipId: context.membership.id,
        roleId: context.role.id,
      }),
    );

    assert.equal(result.id, context.assignment.id);
    assert.equal(result.status, RoleAssignmentStatus.Removed);
    assert.ok(result.removedAt);
  });

  it('is idempotent when assignment is already removed', async () => {
    const context = await seedAssignedRole();
    const handler = new RemoveRoleHandler(
      context.assignmentRepository,
      context.membershipRepository,
      noopEventDispatcher,
    );

    await handler.execute(
      new RemoveRoleCommand({
        membershipId: context.membership.id,
        roleId: context.role.id,
      }),
    );

    const result = await handler.execute(
      new RemoveRoleCommand({
        membershipId: context.membership.id,
        roleId: context.role.id,
      }),
    );

    assert.equal(result.status, RoleAssignmentStatus.Removed);
  });

  it('throws RoleAssignmentNotFoundError when assignment does not exist', async () => {
    const context = await seedAssignedRole();
    const handler = new RemoveRoleHandler(
      new InMemoryRoleAssignmentRepository(),
      context.membershipRepository,
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new RemoveRoleCommand({
            membershipId: context.membership.id,
            roleId: context.role.id,
          }),
        ),
      RoleAssignmentNotFoundError,
    );
  });

  it('dispatches RoleRemoved with explicit tenantId', async () => {
    const context = await seedAssignedRole();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new RemoveRoleHandler(
      context.assignmentRepository,
      context.membershipRepository,
      eventDispatcher,
    );

    await handler.execute(
      new RemoveRoleCommand({
        membershipId: context.membership.id,
        roleId: context.role.id,
      }),
    );

    const event = eventDispatcher.dispatched[0]?.[0] as {
      eventName: string;
      tenantId: string;
      membershipId: string;
      roleId: string;
    };

    assert.equal(event.eventName, 'RoleRemoved');
    assert.equal(event.tenantId, context.tenant.id);
    assert.equal(event.membershipId, context.membership.id);
    assert.equal(event.roleId, context.role.id);
  });
});
