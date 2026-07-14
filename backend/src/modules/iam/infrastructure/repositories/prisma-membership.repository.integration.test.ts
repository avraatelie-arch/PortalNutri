import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import { AddPersonToTenantCommand } from '../../application/add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../../application/add-person-to-tenant/add-person-to-tenant.handler.js';
import { CreatePersonCommand } from '../../application/create-person/create-person.command.js';
import { CreatePersonHandler } from '../../application/create-person/create-person.handler.js';
import { CreateTenantCommand } from '../../application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../application/create-tenant/create-tenant.handler.js';
import { RemovePersonFromTenantCommand } from '../../application/remove-person-from-tenant/remove-person-from-tenant.command.js';
import { RemovePersonFromTenantHandler } from '../../application/remove-person-from-tenant/remove-person-from-tenant.handler.js';
import { DocumentType } from '../../domain/value-objects/document.js';
import { MembershipId } from '../../domain/value-objects/membership-id.js';
import { MembershipStatus } from '../../domain/value-objects/membership-status.js';
import { PersonId } from '../../domain/value-objects/person-id.js';
import { TenantId } from '../../domain/value-objects/tenant-id.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { PrismaMembershipRepository } from './prisma-membership.repository.js';
import { PrismaPersonRepository } from './prisma-person.repository.js';
import { PrismaTenantRepository } from './prisma-tenant.repository.js';

requireDatabaseUrl();

const prisma = new PrismaClient();
const membershipRepository = new PrismaMembershipRepository(prisma);
const personRepository = new PrismaPersonRepository(prisma);
const tenantRepository = new PrismaTenantRepository(prisma);

async function resetMemberships() {
  await prisma.roleAssignment.deleteMany();
  await prisma.role.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.session.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.person.deleteMany();
  await prisma.tenant.deleteMany();
}

describe('PrismaMembershipRepository (integration)', () => {
  before(async () => {
    await resetMemberships();
  });

  after(async () => {
    await resetMemberships();
    await prisma.$disconnect();
  });

  it('persists and finds a membership by id', async () => {
    const person = await new CreatePersonHandler(
      personRepository,
      noopEventDispatcher,
    ).execute(
      new CreatePersonCommand({
        fullName: 'Maria Silva',
        email: 'maria.membership@example.com',
        documentType: DocumentType.PASSPORT,
        document: 'MB123456',
        birthDate: '1990-06-15',
      }),
    );

    const tenant = await new CreateTenantHandler(
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: 'Membership Clinic',
        slug: 'membership-clinic',
      }),
    );

    const created = await new AddPersonToTenantHandler(
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

    const found = await membershipRepository.findById(
      MembershipId.create(created.id),
    );

    assert.ok(found);
    assert.equal(found.getPersonId().toString(), person.id);
    assert.equal(found.getTenantId().toString(), tenant.id);
    assert.equal(found.getStatus(), MembershipStatus.Active);
  });

  it('finds a membership by person and tenant', async () => {
    const person = await new CreatePersonHandler(
      personRepository,
      noopEventDispatcher,
    ).execute(
      new CreatePersonCommand({
        fullName: 'João Santos',
        email: 'joao.membership@example.com',
        documentType: DocumentType.PASSPORT,
        document: 'MB654321',
        birthDate: '1985-03-20',
      }),
    );

    const tenant = await new CreateTenantHandler(
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: 'Pair Lookup Clinic',
        slug: 'pair-lookup-clinic',
      }),
    );

    const created = await new AddPersonToTenantHandler(
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

    const found = await membershipRepository.findByPersonAndTenant(
      PersonId.create(person.id),
      TenantId.create(tenant.id),
    );

    assert.ok(found);
    assert.equal(found.getId().toString(), created.id);
  });

  it('persists logical removal', async () => {
    const person = await new CreatePersonHandler(
      personRepository,
      noopEventDispatcher,
    ).execute(
      new CreatePersonCommand({
        fullName: 'Ana Costa',
        email: 'ana.membership@example.com',
        documentType: DocumentType.PASSPORT,
        document: 'MB111111',
        birthDate: '1992-01-10',
      }),
    );

    const tenant = await new CreateTenantHandler(
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: 'Removal Clinic',
        slug: 'removal-clinic',
      }),
    );

    const created = await new AddPersonToTenantHandler(
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

    await new RemovePersonFromTenantHandler(
      membershipRepository,
      noopEventDispatcher,
    ).execute(
      new RemovePersonFromTenantCommand({
        personId: person.id,
        tenantId: tenant.id,
      }),
    );

    const found = await membershipRepository.findById(
      MembershipId.create(created.id),
    );

    assert.ok(found);
    assert.equal(found.getStatus(), MembershipStatus.Removed);
    assert.ok(found.getRemovedAt());
  });

  it('reactivates an existing membership without creating a second row', async () => {
    const person = await new CreatePersonHandler(
      personRepository,
      noopEventDispatcher,
    ).execute(
      new CreatePersonCommand({
        fullName: 'Paula Lima',
        email: 'paula.membership@example.com',
        documentType: DocumentType.PASSPORT,
        document: 'MB222222',
        birthDate: '1988-11-05',
      }),
    );

    const tenant = await new CreateTenantHandler(
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: 'Reactivation Clinic',
        slug: 'reactivation-clinic',
      }),
    );

    const created = await new AddPersonToTenantHandler(
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

    await new RemovePersonFromTenantHandler(
      membershipRepository,
      noopEventDispatcher,
    ).execute(
      new RemovePersonFromTenantCommand({
        personId: person.id,
        tenantId: tenant.id,
      }),
    );

    const reactivated = await new AddPersonToTenantHandler(
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

    const count = await prisma.membership.count({
      where: {
        personId: person.id,
        tenantId: tenant.id,
      },
    });

    assert.equal(count, 1);
    assert.equal(reactivated.id, created.id);
    assert.equal(reactivated.status, MembershipStatus.Active);
    assert.ok(reactivated.reactivatedAt);
    assert.equal(reactivated.removedAt, null);
  });

  it('returns null when membership does not exist', async () => {
    const found = await membershipRepository.findById(
      MembershipId.create('550e8400-e29b-41d4-a716-446655440099'),
    );

    assert.equal(found, null);
  });
});
