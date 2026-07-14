import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import { CreateRoleCommand } from '../../application/create-role/create-role.command.js';
import { CreateRoleHandler } from '../../application/create-role/create-role.handler.js';
import { CreateTenantCommand } from '../../application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../application/create-tenant/create-tenant.handler.js';
import { Permission } from '../../domain/aggregates/permission.aggregate.js';
import { PermissionAssignment } from '../../domain/aggregates/permission-assignment.aggregate.js';
import { PermissionAssignmentId } from '../../domain/value-objects/permission-assignment-id.js';
import { PermissionAssignmentStatus } from '../../domain/value-objects/permission-assignment-status.js';
import { PermissionName } from '../../domain/value-objects/permission-name.js';
import { RoleId } from '../../domain/value-objects/role-id.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { PrismaPermissionAssignmentRepository } from './prisma-permission-assignment.repository.js';
import { PrismaPermissionRepository } from './prisma-permission.repository.js';
import { PrismaRoleRepository } from './prisma-role.repository.js';
import { PrismaTenantRepository } from './prisma-tenant.repository.js';

requireDatabaseUrl();

const prisma = new PrismaClient();
const assignmentRepository = new PrismaPermissionAssignmentRepository(prisma);
const permissionRepository = new PrismaPermissionRepository(prisma);
const roleRepository = new PrismaRoleRepository(prisma);
const tenantRepository = new PrismaTenantRepository(prisma);

async function resetPermissionAssignments() {
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

async function seedPermissionAssignmentContext() {
  seedCounter += 1;
  const suffix = seedCounter;

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: `Permission Assignment Clinic ${suffix}`,
      slug: `permission-assignment-clinic-${suffix}`,
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

  const permission = Permission.create({
    tenantId: TenantId.create(tenant.id),
    name: PermissionName.create('Manage Patients'),
  });

  await permissionRepository.save(permission);

  return { tenant, role, permission };
}

describe('PrismaPermissionAssignmentRepository (integration)', () => {
  before(async () => {
    await resetPermissionAssignments();
  });

  after(async () => {
    await resetPermissionAssignments();
    await prisma.$disconnect();
  });

  it('persists and finds a permission assignment by id', async () => {
    const context = await seedPermissionAssignmentContext();
    const assignment = PermissionAssignment.create(
      {
        roleId: RoleId.create(context.role.id),
        permissionId: context.permission.getId(),
      },
      context.tenant.id,
    );

    await assignmentRepository.save(assignment);

    const found = await assignmentRepository.findById(assignment.getId());

    assert.ok(found);
    assert.equal(found.getRoleId().toString(), context.role.id);
    assert.equal(
      found.getPermissionId().toString(),
      context.permission.getId().toString(),
    );
    assert.equal(found.getStatus(), PermissionAssignmentStatus.Active);
  });

  it('finds a permission assignment by role and permission', async () => {
    const context = await seedPermissionAssignmentContext();
    const assignment = PermissionAssignment.create(
      {
        roleId: RoleId.create(context.role.id),
        permissionId: context.permission.getId(),
      },
      context.tenant.id,
    );

    await assignmentRepository.save(assignment);

    const found = await assignmentRepository.findByRoleAndPermission(
      RoleId.create(context.role.id),
      context.permission.getId(),
    );

    assert.ok(found);
    assert.equal(found.getId().toString(), assignment.getId().toString());
  });

  it('persists logical removal and reactivation in place', async () => {
    const context = await seedPermissionAssignmentContext();
    const assignment = PermissionAssignment.create(
      {
        roleId: RoleId.create(context.role.id),
        permissionId: context.permission.getId(),
      },
      context.tenant.id,
    );

    await assignmentRepository.save(assignment);

    assignment.remove(context.tenant.id);
    await assignmentRepository.save(assignment);

    const removed = await assignmentRepository.findById(assignment.getId());

    assert.ok(removed);
    assert.equal(removed.getStatus(), PermissionAssignmentStatus.Removed);
    assert.ok(removed.getRemovedAt());

    removed.reactivate(context.tenant.id);
    await assignmentRepository.save(removed);

    const count = await prisma.permissionAssignment.count({
      where: {
        roleId: context.role.id,
        permissionId: context.permission.getId().toString(),
      },
    });

    const reactivated = await assignmentRepository.findById(assignment.getId());

    assert.equal(count, 1);
    assert.ok(reactivated);
    assert.equal(reactivated.getStatus(), PermissionAssignmentStatus.Active);
    assert.ok(reactivated.getReactivatedAt());
    assert.equal(reactivated.getRemovedAt(), null);
  });

  it('returns null when assignment does not exist', async () => {
    const found = await assignmentRepository.findById(
      PermissionAssignmentId.create('550e8400-e29b-41d4-a716-446655440099'),
    );

    assert.equal(found, null);
  });
});
