import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { MembershipStatus } from '../../domain/value-objects/membership-status.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
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
import { RemovePersonFromTenantCommand } from './remove-person-from-tenant.command.js';
import { RemovePersonFromTenantHandler } from './remove-person-from-tenant.handler.js';

const UNKNOWN_PERSON_ID = '550e8400-e29b-41d4-a716-446655440099';
const UNKNOWN_TENANT_ID = '550e8400-e29b-41d4-a716-446655440098';

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

  return {
    membershipRepository,
    person,
    tenant,
    membership,
  };
}

describe('RemovePersonFromTenantHandler', () => {
  it('logically removes an active membership', async () => {
    const { membershipRepository, person, tenant } = await seedMembership();
    const handler = new RemovePersonFromTenantHandler(
      membershipRepository,
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new RemovePersonFromTenantCommand({
        personId: person.id,
        tenantId: tenant.id,
      }),
    );

    assert.equal(result.status, MembershipStatus.Removed);
    assert.ok(result.removedAt);
  });

  it('dispatches MembershipRemoved only when state changes', async () => {
    const { membershipRepository, person, tenant } = await seedMembership();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new RemovePersonFromTenantHandler(
      membershipRepository,
      eventDispatcher,
    );

    await handler.execute(
      new RemovePersonFromTenantCommand({
        personId: person.id,
        tenantId: tenant.id,
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'MembershipRemoved',
    );

    await handler.execute(
      new RemovePersonFromTenantCommand({
        personId: person.id,
        tenantId: tenant.id,
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
  });

  it('returns success when membership is already removed', async () => {
    const { membershipRepository, person, tenant } = await seedMembership();
    const handler = new RemovePersonFromTenantHandler(
      membershipRepository,
      noopEventDispatcher,
    );

    await handler.execute(
      new RemovePersonFromTenantCommand({
        personId: person.id,
        tenantId: tenant.id,
      }),
    );

    const result = await handler.execute(
      new RemovePersonFromTenantCommand({
        personId: person.id,
        tenantId: tenant.id,
      }),
    );

    assert.equal(result.status, MembershipStatus.Removed);
  });

  it('throws MembershipNotFoundError when membership does not exist', async () => {
    const handler = new RemovePersonFromTenantHandler(
      new InMemoryMembershipRepository(),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new RemovePersonFromTenantCommand({
            personId: UNKNOWN_PERSON_ID,
            tenantId: UNKNOWN_TENANT_ID,
          }),
        ),
      MembershipNotFoundError,
    );
  });
});
