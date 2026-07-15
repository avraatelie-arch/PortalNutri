import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getPrismaClient } from '../core/database/prisma-client.js';
import { AddPersonToTenantCommand } from '../modules/iam/application/add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../modules/iam/application/add-person-to-tenant/add-person-to-tenant.handler.js';
import { AssignRoleCommand } from '../modules/iam/application/assign-role/assign-role.command.js';
import { AssignRoleHandler } from '../modules/iam/application/assign-role/assign-role.handler.js';
import { AuthorizationPermissionKey } from '../modules/iam/application/authorization/authorization-permission-key.js';
import { CreatePermissionCommand } from '../modules/iam/application/create-permission/create-permission.command.js';
import { CreatePermissionHandler } from '../modules/iam/application/create-permission/create-permission.handler.js';
import { CreateRoleCommand } from '../modules/iam/application/create-role/create-role.command.js';
import { CreateRoleHandler } from '../modules/iam/application/create-role/create-role.handler.js';
import { CreateTenantCommand } from '../modules/iam/application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../modules/iam/application/create-tenant/create-tenant.handler.js';
import { GrantPermissionCommand } from '../modules/iam/application/grant-permission/grant-permission.command.js';
import { GrantPermissionHandler } from '../modules/iam/application/grant-permission/grant-permission.handler.js';
import { RemovePersonFromTenantCommand } from '../modules/iam/application/remove-person-from-tenant/remove-person-from-tenant.command.js';
import { RemovePersonFromTenantHandler } from '../modules/iam/application/remove-person-from-tenant/remove-person-from-tenant.handler.js';
import { RevokePermissionCommand } from '../modules/iam/application/revoke-permission/revoke-permission.command.js';
import { RevokePermissionHandler } from '../modules/iam/application/revoke-permission/revoke-permission.handler.js';
import { PrismaMembershipRepository } from '../modules/iam/infrastructure/repositories/prisma-membership.repository.js';
import { PrismaPermissionAssignmentRepository } from '../modules/iam/infrastructure/repositories/prisma-permission-assignment.repository.js';
import { PrismaPermissionRepository } from '../modules/iam/infrastructure/repositories/prisma-permission.repository.js';
import { PrismaPersonRepository } from '../modules/iam/infrastructure/repositories/prisma-person.repository.js';
import { PrismaRoleAssignmentRepository } from '../modules/iam/infrastructure/repositories/prisma-role-assignment.repository.js';
import { PrismaRoleRepository } from '../modules/iam/infrastructure/repositories/prisma-role.repository.js';
import { PrismaTenantRepository } from '../modules/iam/infrastructure/repositories/prisma-tenant.repository.js';
import { noopEventDispatcher } from './noop-event-dispatcher.js';

export type PersonPermissionName =
  | 'PERSON_READ'
  | 'PERSON_CREATE'
  | 'PERSON_UPDATE'
  | 'PERSON_DELETE';

export type TenantPermissionName =
  | 'TENANT_READ'
  | 'TENANT_CREATE'
  | 'TENANT_UPDATE';

export type IamPermissionName = PersonPermissionName | TenantPermissionName;

export interface RbacFixture {
  tenantId: string;
  membershipId: string;
  roleId: string;
  permissionIds: Partial<Record<IamPermissionName, string>>;
}

export interface ResetIamDataOptions {
  includeTenants?: boolean;
}

export async function resetIamData(
  options: ResetIamDataOptions = {},
): Promise<void> {
  const prisma = getPrismaClient();

  await prisma.permissionAssignment.deleteMany();
  await prisma.roleAssignment.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.session.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.person.deleteMany();

  if (options.includeTenants) {
    await prisma.tenant.deleteMany();
  }
}

export async function resetRbacFixtures(): Promise<void> {
  await resetIamData({ includeTenants: true });
}

export async function bindSessionTenant(
  sessionId: string,
  tenantId: string,
): Promise<void> {
  const prisma = getPrismaClient();

  await prisma.session.update({
    where: { id: sessionId },
    data: { tenantId },
  });
}

export async function seedRbacFixture(params: {
  personId: string;
  permissions: IamPermissionName[];
  membershipActive?: boolean;
  assignRole?: boolean;
  grantPermissions?: boolean;
}): Promise<RbacFixture> {
  const prisma = getPrismaClient();
  const tenantRepository = new PrismaTenantRepository(prisma);
  const membershipRepository = new PrismaMembershipRepository(prisma);
  const personRepository = new PrismaPersonRepository(prisma);
  const roleRepository = new PrismaRoleRepository(prisma);
  const roleAssignmentRepository = new PrismaRoleAssignmentRepository(prisma);
  const permissionRepository = new PrismaPermissionRepository(prisma);
  const permissionAssignmentRepository =
    new PrismaPermissionAssignmentRepository(prisma);

  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: `Authorization Clinic ${uniqueSuffix}`,
      slug: `authz-clinic-${uniqueSuffix}`,
    }),
  );

  const membership = await new AddPersonToTenantHandler(
    membershipRepository,
    personRepository,
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new AddPersonToTenantCommand({
      personId: params.personId,
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
      name: `Person Manager ${uniqueSuffix}`,
    }),
  );

  if (params.assignRole !== false) {
    await new AssignRoleHandler(
      roleAssignmentRepository,
      membershipRepository,
      roleRepository,
      noopEventDispatcher,
    ).execute(
      new AssignRoleCommand({
        membershipId: membership.id,
        roleId: role.id,
      }),
    );
  }

  if (params.membershipActive === false) {
    await new RemovePersonFromTenantHandler(
      membershipRepository,
      noopEventDispatcher,
    ).execute(
      new RemovePersonFromTenantCommand({
        personId: params.personId,
        tenantId: tenant.id,
      }),
    );
  }

  const permissionIds: Partial<Record<IamPermissionName, string>> = {};

  for (const permissionName of params.permissions) {
    const permission = await new CreatePermissionHandler(
      permissionRepository,
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreatePermissionCommand({
        tenantId: tenant.id,
        name: permissionName,
      }),
    );

    permissionIds[permissionName] = permission.id;

    if (params.grantPermissions !== false) {
      await new GrantPermissionHandler(
        permissionAssignmentRepository,
        roleRepository,
        permissionRepository,
        noopEventDispatcher,
      ).execute(
        new GrantPermissionCommand({
          roleId: role.id,
          permissionId: permission.id,
        }),
      );
    }
  }

  return {
    tenantId: tenant.id,
    membershipId: membership.id,
    roleId: role.id,
    permissionIds,
  };
}

export async function seedTenantOnly(slug: string): Promise<string> {
  const prisma = getPrismaClient();
  const tenantRepository = new PrismaTenantRepository(prisma);

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Other Tenant',
      slug,
    }),
  );

  return tenant.id;
}

export async function revokeGrantedPermission(params: {
  roleId: string;
  permissionId: string;
}): Promise<void> {
  const prisma = getPrismaClient();
  const roleRepository = new PrismaRoleRepository(prisma);
  const permissionAssignmentRepository =
    new PrismaPermissionAssignmentRepository(prisma);

  await new RevokePermissionHandler(
    permissionAssignmentRepository,
    roleRepository,
    noopEventDispatcher,
  ).execute(
    new RevokePermissionCommand({
      roleId: params.roleId,
      permissionId: params.permissionId,
    }),
  );
}

export function assertPermissionKeyNormalization(): void {
  assert.equal(AuthorizationPermissionKey.PERSON_READ, 'person_read');
  assert.equal(AuthorizationPermissionKey.PERSON_CREATE, 'person_create');
  assert.equal(AuthorizationPermissionKey.PERSON_UPDATE, 'person_update');
  assert.equal(AuthorizationPermissionKey.PERSON_DELETE, 'person_delete');
  assert.equal(AuthorizationPermissionKey.TENANT_READ, 'tenant_read');
  assert.equal(AuthorizationPermissionKey.TENANT_CREATE, 'tenant_create');
  assert.equal(AuthorizationPermissionKey.TENANT_UPDATE, 'tenant_update');
}
