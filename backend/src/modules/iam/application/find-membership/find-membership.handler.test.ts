import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { MembershipStatus } from '../../domain/value-objects/membership-status.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { AddPersonToTenantCommand } from '../add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../add-person-to-tenant/add-person-to-tenant.handler.js';
import { CreatePersonCommand } from '../create-person/create-person.command.js';
import { CreatePersonHandler } from '../create-person/create-person.handler.js';
import { CreateTenantCommand } from '../create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../create-tenant/create-tenant.handler.js';
import { MembershipNotFoundError } from '../errors/membership-not-found.error.js';
import { InMemoryMembershipRepository } from '../../infrastructure/repositories/in-memory-membership.repository.js';
import { InMemoryPersonRepository } from '../../infrastructure/repositories/in-memory-person.repository.js';
import { InMemoryTenantRepository } from '../../infrastructure/repositories/in-memory-tenant.repository.js';
import { FindMembershipHandler } from './find-membership.handler.js';
import { FindMembershipQuery } from './find-membership.query.js';

const UNKNOWN_MEMBERSHIP_ID = '550e8400-e29b-41d4-a716-446655440099';

async function seedMembership() {
  const personRepository = new InMemoryPersonRepository();
  const tenantRepository = new InMemoryTenantRepository();
  const membershipRepository = new InMemoryMembershipRepository();

  const person = await new CreatePersonHandler(
    personRepository,
    noopEventDispatcher,
  ).execute(
    new CreatePersonCommand({
      fullName: 'Maria Silva',
      email: 'maria.silva@example.com',
      documentType: DocumentType.PASSPORT,
      document: 'AB123456',
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

  return { membershipRepository, membership };
}

describe('FindMembershipHandler', () => {
  it('finds a membership by id', async () => {
    const { membershipRepository, membership } = await seedMembership();
    const handler = new FindMembershipHandler(membershipRepository);

    const result = await handler.execute(
      new FindMembershipQuery(membership.id),
    );

    assert.equal(result.id, membership.id);
    assert.equal(result.personId, membership.personId);
    assert.equal(result.tenantId, membership.tenantId);
    assert.equal(result.status, MembershipStatus.Active);
  });

  it('throws MembershipNotFoundError when membership does not exist', async () => {
    const handler = new FindMembershipHandler(
      new InMemoryMembershipRepository(),
    );

    await assert.rejects(
      () => handler.execute(new FindMembershipQuery(UNKNOWN_MEMBERSHIP_ID)),
      MembershipNotFoundError,
    );
  });
});
