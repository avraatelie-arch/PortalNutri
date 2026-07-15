import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { AddPersonToTenantCommand } from '../../application/add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../../application/add-person-to-tenant/add-person-to-tenant.handler.js';
import { AssignRoleCommand } from '../../application/assign-role/assign-role.command.js';
import { AssignRoleHandler } from '../../application/assign-role/assign-role.handler.js';
import { AuthorizationPermissionKey } from '../../application/authorization/authorization-permission-key.js';
import { CreatePermissionCommand } from '../../application/create-permission/create-permission.command.js';
import { CreatePermissionHandler } from '../../application/create-permission/create-permission.handler.js';
import { CreateRoleCommand } from '../../application/create-role/create-role.command.js';
import { CreateRoleHandler } from '../../application/create-role/create-role.handler.js';
import { CreateTenantCommand } from '../../application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../application/create-tenant/create-tenant.handler.js';
import { GrantPermissionCommand } from '../../application/grant-permission/grant-permission.command.js';
import { GrantPermissionHandler } from '../../application/grant-permission/grant-permission.handler.js';
import { RemovePersonFromTenantCommand } from '../../application/remove-person-from-tenant/remove-person-from-tenant.command.js';
import { RemovePersonFromTenantHandler } from '../../application/remove-person-from-tenant/remove-person-from-tenant.handler.js';
import { RevokePermissionCommand } from '../../application/revoke-permission/revoke-permission.command.js';
import { RevokePermissionHandler } from '../../application/revoke-permission/revoke-permission.handler.js';
import { Person } from '../../domain/aggregates/person.aggregate.js';
import { DocumentType } from '../../domain/value-objects/document.js';
import { BirthDate } from '../../domain/value-objects/birth-date.js';
import { Document } from '../../domain/value-objects/document.js';
import { Email } from '../../domain/value-objects/email.js';
import { FullName } from '../../domain/value-objects/full-name.js';
import { RepositoryEffectivePermissionResolver } from './repository-effective-permission-resolver.js';
import { InMemoryMembershipRepository } from '../repositories/in-memory-membership.repository.js';
import { InMemoryPermissionAssignmentRepository } from '../repositories/in-memory-permission-assignment.repository.js';
import { InMemoryPermissionRepository } from '../repositories/in-memory-permission.repository.js';
import { InMemoryPersonRepository } from '../repositories/in-memory-person.repository.js';
import { InMemoryRoleAssignmentRepository } from '../repositories/in-memory-role-assignment.repository.js';
import { InMemoryRoleRepository } from '../repositories/in-memory-role.repository.js';
import { InMemoryTenantRepository } from '../repositories/in-memory-tenant.repository.js';

async function seedPerson(personRepository: InMemoryPersonRepository) {
  const person = Person.create({
    fullName: FullName.create('Maria Silva'),
    email: Email.create('maria@example.com'),
    document: Document.create(DocumentType.PASSPORT, 'AB123456'),
    birthDate: BirthDate.create(new Date(1990, 5, 15)),
  });

  await personRepository.save(person);

  return person;
}

async function seedRbacChain(options?: {
  membershipActive?: boolean;
  assignRole?: boolean;
  grantPermission?: boolean;
}) {
  const tenantRepository = new InMemoryTenantRepository();
  const membershipRepository = new InMemoryMembershipRepository();
  const personRepository = new InMemoryPersonRepository();
  const roleRepository = new InMemoryRoleRepository();
  const roleAssignmentRepository = new InMemoryRoleAssignmentRepository();
  const permissionRepository = new InMemoryPermissionRepository();
  const permissionAssignmentRepository =
    new InMemoryPermissionAssignmentRepository();

  const person = await seedPerson(personRepository);

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Authorization Clinic',
      slug: 'authorization-clinic',
    }),
  );

  const membership = await new AddPersonToTenantHandler(
    membershipRepository,
    personRepository,
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new AddPersonToTenantCommand({
      personId: person.getId().toString(),
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
      name: 'Person Manager',
    }),
  );

  if (options?.assignRole !== false) {
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

  if (options?.membershipActive === false) {
    await new RemovePersonFromTenantHandler(
      membershipRepository,
      noopEventDispatcher,
    ).execute(
      new RemovePersonFromTenantCommand({
        personId: person.getId().toString(),
        tenantId: tenant.id,
      }),
    );
  }

  const permission = await new CreatePermissionHandler(
    permissionRepository,
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreatePermissionCommand({
      tenantId: tenant.id,
      name: 'PERSON_READ',
    }),
  );

  if (options?.grantPermission !== false) {
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

  const resolver = new RepositoryEffectivePermissionResolver({
    membershipRepository,
    roleAssignmentRepository,
    roleRepository,
    permissionAssignmentRepository,
    permissionRepository,
  });

  return {
    resolver,
    personId: person.getId().toString(),
    tenantId: tenant.id,
    permissionId: permission.id,
    roleId: role.id,
    permissionAssignmentRepository,
    roleRepository,
  };
}

describe('RepositoryEffectivePermissionResolver', () => {
  it('returns true when permission is granted through the RBAC chain', async () => {
    const { resolver, personId, tenantId } = await seedRbacChain();

    assert.equal(
      await resolver.hasActivePermission({
        personId,
        tenantId,
        permissionKey: AuthorizationPermissionKey.PERSON_READ,
      }),
      true,
    );
  });

  it('returns false when membership is missing', async () => {
    const { resolver, tenantId } = await seedRbacChain();

    assert.equal(
      await resolver.hasActivePermission({
        personId: '550e8400-e29b-41d4-a716-446655440099',
        tenantId,
        permissionKey: AuthorizationPermissionKey.PERSON_READ,
      }),
      false,
    );
  });

  it('returns false when membership is inactive', async () => {
    const { resolver, personId, tenantId } = await seedRbacChain({
      membershipActive: false,
    });

    assert.equal(
      await resolver.hasActivePermission({
        personId,
        tenantId,
        permissionKey: AuthorizationPermissionKey.PERSON_READ,
      }),
      false,
    );
  });

  it('returns false when role assignment is missing', async () => {
    const { resolver, personId, tenantId } = await seedRbacChain({
      assignRole: false,
    });

    assert.equal(
      await resolver.hasActivePermission({
        personId,
        tenantId,
        permissionKey: AuthorizationPermissionKey.PERSON_READ,
      }),
      false,
    );
  });

  it('returns false when permission assignment is missing', async () => {
    const { resolver, personId, tenantId } = await seedRbacChain({
      grantPermission: false,
    });

    assert.equal(
      await resolver.hasActivePermission({
        personId,
        tenantId,
        permissionKey: AuthorizationPermissionKey.PERSON_READ,
      }),
      false,
    );
  });

  it('returns false when permission assignment is inactive', async () => {
    const {
      resolver,
      personId,
      tenantId,
      roleId,
      permissionId,
      permissionAssignmentRepository,
      roleRepository,
    } = await seedRbacChain();

    await new RevokePermissionHandler(
      permissionAssignmentRepository,
      roleRepository,
      noopEventDispatcher,
    ).execute(
      new RevokePermissionCommand({
        roleId,
        permissionId,
      }),
    );

    assert.equal(
      await resolver.hasActivePermission({
        personId,
        tenantId,
        permissionKey: AuthorizationPermissionKey.PERSON_READ,
      }),
      false,
    );
  });

  it('returns false for cross-tenant access', async () => {
    const tenantRepository = new InMemoryTenantRepository();
    const { resolver, personId } = await seedRbacChain();

    const otherTenant = await new CreateTenantHandler(
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: 'Other Clinic',
        slug: 'other-clinic',
      }),
    );

    assert.equal(
      await resolver.hasActivePermission({
        personId,
        tenantId: otherTenant.id,
        permissionKey: AuthorizationPermissionKey.PERSON_READ,
      }),
      false,
    );
  });
});
