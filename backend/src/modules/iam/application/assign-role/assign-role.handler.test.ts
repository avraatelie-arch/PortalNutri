import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { RoleAssignmentStatus } from '../../domain/value-objects/role-assignment-status.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { AddPersonToTenantCommand } from '../add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../add-person-to-tenant/add-person-to-tenant.handler.js';
import { CreatePersonCommand } from '../create-person/create-person.command.js';
import { CreatePersonHandler } from '../create-person/create-person.handler.js';
import { CreateRoleCommand } from '../create-role/create-role.command.js';
import { CreateRoleHandler } from '../create-role/create-role.handler.js';
import { CreateTenantCommand } from '../create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../create-tenant/create-tenant.handler.js';
import { RoleAssignmentAlreadyExistsError } from '../errors/role-assignment-already-exists.error.js';
import { RoleTenantMismatchError } from '../errors/role-tenant-mismatch.error.js';
import { RemoveRoleCommand } from '../remove-role/remove-role.command.js';
import { RemoveRoleHandler } from '../remove-role/remove-role.handler.js';
import { InMemoryMembershipRepository } from '../../infrastructure/repositories/in-memory-membership.repository.js';
import { InMemoryPersonRepository } from '../../infrastructure/repositories/in-memory-person.repository.js';
import { InMemoryRoleAssignmentRepository } from '../../infrastructure/repositories/in-memory-role-assignment.repository.js';
import { InMemoryRoleRepository } from '../../infrastructure/repositories/in-memory-role.repository.js';
import { InMemoryTenantRepository } from '../../infrastructure/repositories/in-memory-tenant.repository.js';
import { AssignRoleCommand } from './assign-role.command.js';
import { AssignRoleHandler } from './assign-role.handler.js';

async function seedMembershipContext() {
  const personRepository = new InMemoryPersonRepository();
  const tenantRepository = new InMemoryTenantRepository();
  const membershipRepository = new InMemoryMembershipRepository();
  const roleRepository = new InMemoryRoleRepository();

  const person = await new CreatePersonHandler(
    personRepository,
    noopEventDispatcher,
  ).execute(
    new CreatePersonCommand({
      fullName: 'Maria Silva',
      email: 'maria.role@example.com',
      documentType: DocumentType.PASSPORT,
      document: 'RB123456',
      birthDate: '1990-06-15',
    }),
  );

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Portal Nutri Clinic',
      slug: 'portal-nutri-clinic',
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

  return {
    personRepository,
    tenantRepository,
    membershipRepository,
    roleRepository,
    membership,
    role,
    tenant,
  };
}

describe('AssignRoleHandler', () => {
  it('assigns a role to an active membership', async () => {
    const context = await seedMembershipContext();
    const handler = new AssignRoleHandler(
      new InMemoryRoleAssignmentRepository(),
      context.membershipRepository,
      context.roleRepository,
      noopEventDispatcher,
    );

    const response = await handler.execute(
      new AssignRoleCommand({
        membershipId: context.membership.id,
        roleId: context.role.id,
      }),
    );

    assert.equal(response.membershipId, context.membership.id);
    assert.equal(response.roleId, context.role.id);
    assert.equal(response.status, RoleAssignmentStatus.Active);
  });

  it('denies assignment when role tenant differs from membership tenant', async () => {
    const context = await seedMembershipContext();
    const otherTenant = await new CreateTenantHandler(
      context.tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: 'Other Clinic',
        slug: 'other-clinic',
      }),
    );
    const foreignRole = await new CreateRoleHandler(
      context.roleRepository,
      context.tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateRoleCommand({
        tenantId: otherTenant.id,
        name: 'Foreign Admin',
      }),
    );
    const handler = new AssignRoleHandler(
      new InMemoryRoleAssignmentRepository(),
      context.membershipRepository,
      context.roleRepository,
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new AssignRoleCommand({
            membershipId: context.membership.id,
            roleId: foreignRole.id,
          }),
        ),
      RoleTenantMismatchError,
    );
  });

  it('reactivates a removed assignment', async () => {
    const context = await seedMembershipContext();
    const assignmentRepository = new InMemoryRoleAssignmentRepository();
    const assignHandler = new AssignRoleHandler(
      assignmentRepository,
      context.membershipRepository,
      context.roleRepository,
      noopEventDispatcher,
    );
    const created = await assignHandler.execute(
      new AssignRoleCommand({
        membershipId: context.membership.id,
        roleId: context.role.id,
      }),
    );

    await new RemoveRoleHandler(
      assignmentRepository,
      context.membershipRepository,
      noopEventDispatcher,
    ).execute(
      new RemoveRoleCommand({
        membershipId: context.membership.id,
        roleId: context.role.id,
      }),
    );

    const reactivated = await assignHandler.execute(
      new AssignRoleCommand({
        membershipId: context.membership.id,
        roleId: context.role.id,
      }),
    );

    assert.equal(reactivated.id, created.id);
    assert.equal(reactivated.status, RoleAssignmentStatus.Active);
  });

  it('rejects duplicate active assignments', async () => {
    const context = await seedMembershipContext();
    const assignmentRepository = new InMemoryRoleAssignmentRepository();
    const handler = new AssignRoleHandler(
      assignmentRepository,
      context.membershipRepository,
      context.roleRepository,
      noopEventDispatcher,
    );

    await handler.execute(
      new AssignRoleCommand({
        membershipId: context.membership.id,
        roleId: context.role.id,
      }),
    );

    await assert.rejects(
      () =>
        handler.execute(
          new AssignRoleCommand({
            membershipId: context.membership.id,
            roleId: context.role.id,
          }),
        ),
      RoleAssignmentAlreadyExistsError,
    );
  });

  it('dispatches RoleAssigned with explicit tenantId', async () => {
    const context = await seedMembershipContext();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new AssignRoleHandler(
      new InMemoryRoleAssignmentRepository(),
      context.membershipRepository,
      context.roleRepository,
      eventDispatcher,
    );

    await handler.execute(
      new AssignRoleCommand({
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

    assert.equal(event.eventName, 'RoleAssigned');
    assert.equal(event.tenantId, context.tenant.id);
    assert.equal(event.membershipId, context.membership.id);
    assert.equal(event.roleId, context.role.id);
  });
});
