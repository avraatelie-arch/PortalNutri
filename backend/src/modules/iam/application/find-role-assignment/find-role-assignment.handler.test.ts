import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { RoleAssignmentStatus } from '../../domain/value-objects/role-assignment-status.js';
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
import { FindRoleAssignmentHandler } from './find-role-assignment.handler.js';
import { FindRoleAssignmentQuery } from './find-role-assignment.query.js';

const UNKNOWN_ASSIGNMENT_ID = '550e8400-e29b-41d4-a716-446655440099';

async function seedAssignment() {
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
      email: 'maria.find-assignment@example.com',
      documentType: DocumentType.PASSPORT,
      document: 'FA123456',
      birthDate: '1990-06-15',
    }),
  );

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Find Assignment Clinic',
      slug: 'find-assignment-clinic',
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

  return { assignmentRepository, assignment };
}

describe('FindRoleAssignmentHandler', () => {
  it('finds a role assignment by id', async () => {
    const { assignmentRepository, assignment } = await seedAssignment();
    const handler = new FindRoleAssignmentHandler(assignmentRepository);

    const result = await handler.execute(
      new FindRoleAssignmentQuery(assignment.id),
    );

    assert.equal(result.id, assignment.id);
    assert.equal(result.membershipId, assignment.membershipId);
    assert.equal(result.roleId, assignment.roleId);
    assert.equal(result.status, RoleAssignmentStatus.Active);
  });

  it('throws RoleAssignmentNotFoundError when assignment does not exist', async () => {
    const handler = new FindRoleAssignmentHandler(
      new InMemoryRoleAssignmentRepository(),
    );

    await assert.rejects(
      () => handler.execute(new FindRoleAssignmentQuery(UNKNOWN_ASSIGNMENT_ID)),
      RoleAssignmentNotFoundError,
    );
  });
});
