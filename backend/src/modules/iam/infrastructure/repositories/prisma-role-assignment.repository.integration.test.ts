import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import { AddPersonToTenantCommand } from '../../application/add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../../application/add-person-to-tenant/add-person-to-tenant.handler.js';
import { AssignRoleCommand } from '../../application/assign-role/assign-role.command.js';
import { AssignRoleHandler } from '../../application/assign-role/assign-role.handler.js';
import { CreatePersonCommand } from '../../application/create-person/create-person.command.js';
import { CreatePersonHandler } from '../../application/create-person/create-person.handler.js';
import { CreateRoleCommand } from '../../application/create-role/create-role.command.js';
import { CreateRoleHandler } from '../../application/create-role/create-role.handler.js';
import { CreateTenantCommand } from '../../application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../application/create-tenant/create-tenant.handler.js';
import { RemoveRoleCommand } from '../../application/remove-role/remove-role.command.js';
import { RemoveRoleHandler } from '../../application/remove-role/remove-role.handler.js';
import { DocumentType } from '../../domain/value-objects/document.js';
import { MembershipId } from '../../domain/value-objects/membership-id.js';
import { RoleAssignmentId } from '../../domain/value-objects/role-assignment-id.js';
import { RoleAssignmentStatus } from '../../domain/value-objects/role-assignment-status.js';
import { RoleId } from '../../domain/value-objects/role-id.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { PrismaMembershipRepository } from './prisma-membership.repository.js';
import { PrismaPersonRepository } from './prisma-person.repository.js';
import { PrismaRoleAssignmentRepository } from './prisma-role-assignment.repository.js';
import { PrismaRoleRepository } from './prisma-role.repository.js';
import { PrismaTenantRepository } from './prisma-tenant.repository.js';

requireDatabaseUrl();

const prisma = new PrismaClient();
const assignmentRepository = new PrismaRoleAssignmentRepository(prisma);
const membershipRepository = new PrismaMembershipRepository(prisma);
const personRepository = new PrismaPersonRepository(prisma);
const roleRepository = new PrismaRoleRepository(prisma);
const tenantRepository = new PrismaTenantRepository(prisma);

async function resetRoleAssignments() {
  await prisma.permissionAssignment.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.roleAssignment.deleteMany();
  await prisma.role.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.session.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.person.deleteMany();
  await prisma.tenant.deleteMany();
}

let seedCounter = 0;

async function seedAssignmentContext() {
  seedCounter += 1;
  const suffix = seedCounter;

  const person = await new CreatePersonHandler(
    personRepository,
    noopEventDispatcher,
  ).execute(
    new CreatePersonCommand({
      fullName: 'Maria Silva',
      email: `maria.role-assignment-${suffix}@example.com`,
      documentType: DocumentType.PASSPORT,
      document: `RA${String(suffix).padStart(6, '0')}`,
      birthDate: '1990-06-15',
    }),
  );

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: `Role Assignment Clinic ${suffix}`,
      slug: `role-assignment-clinic-${suffix}`,
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

  return { membership, role };
}

describe('PrismaRoleAssignmentRepository (integration)', () => {
  before(async () => {
    await resetRoleAssignments();
  });

  after(async () => {
    await resetRoleAssignments();
    await prisma.$disconnect();
  });

  it('persists and finds a role assignment by id', async () => {
    const context = await seedAssignmentContext();
    const created = await new AssignRoleHandler(
      assignmentRepository,
      membershipRepository,
      roleRepository,
      noopEventDispatcher,
    ).execute(
      new AssignRoleCommand({
        membershipId: context.membership.id,
        roleId: context.role.id,
      }),
    );

    const found = await assignmentRepository.findById(
      RoleAssignmentId.create(created.id),
    );

    assert.ok(found);
    assert.equal(found.getMembershipId().toString(), context.membership.id);
    assert.equal(found.getRoleId().toString(), context.role.id);
    assert.equal(found.getStatus(), RoleAssignmentStatus.Active);
  });

  it('finds a role assignment by membership and role', async () => {
    const context = await seedAssignmentContext();
    const created = await new AssignRoleHandler(
      assignmentRepository,
      membershipRepository,
      roleRepository,
      noopEventDispatcher,
    ).execute(
      new AssignRoleCommand({
        membershipId: context.membership.id,
        roleId: context.role.id,
      }),
    );

    const found = await assignmentRepository.findByMembershipAndRole(
      MembershipId.create(context.membership.id),
      RoleId.create(context.role.id),
    );

    assert.ok(found);
    assert.equal(found.getId().toString(), created.id);
  });

  it('persists logical removal and reactivation in place', async () => {
    const context = await seedAssignmentContext();
    const created = await new AssignRoleHandler(
      assignmentRepository,
      membershipRepository,
      roleRepository,
      noopEventDispatcher,
    ).execute(
      new AssignRoleCommand({
        membershipId: context.membership.id,
        roleId: context.role.id,
      }),
    );

    await new RemoveRoleHandler(
      assignmentRepository,
      membershipRepository,
      noopEventDispatcher,
    ).execute(
      new RemoveRoleCommand({
        membershipId: context.membership.id,
        roleId: context.role.id,
      }),
    );

    const removed = await assignmentRepository.findById(
      RoleAssignmentId.create(created.id),
    );

    assert.ok(removed);
    assert.equal(removed.getStatus(), RoleAssignmentStatus.Removed);
    assert.ok(removed.getRemovedAt());

    await new AssignRoleHandler(
      assignmentRepository,
      membershipRepository,
      roleRepository,
      noopEventDispatcher,
    ).execute(
      new AssignRoleCommand({
        membershipId: context.membership.id,
        roleId: context.role.id,
      }),
    );

    const count = await prisma.roleAssignment.count({
      where: {
        membershipId: context.membership.id,
        roleId: context.role.id,
      },
    });

    const reactivated = await assignmentRepository.findById(
      RoleAssignmentId.create(created.id),
    );

    assert.equal(count, 1);
    assert.ok(reactivated);
    assert.equal(reactivated.getStatus(), RoleAssignmentStatus.Active);
    assert.ok(reactivated.getReactivatedAt());
    assert.equal(reactivated.getRemovedAt(), null);
  });

  it('returns null when assignment does not exist', async () => {
    const found = await assignmentRepository.findById(
      RoleAssignmentId.create('550e8400-e29b-41d4-a716-446655440099'),
    );

    assert.equal(found, null);
  });
});
