import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../domain/value-objects/document.js';
import { MembershipStatus } from '../../domain/value-objects/membership-status.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreatePersonCommand } from '../create-person/create-person.command.js';
import { CreatePersonHandler } from '../create-person/create-person.handler.js';
import { DeactivatePersonCommand } from '../deactivate-person/deactivate-person.command.js';
import { DeactivatePersonHandler } from '../deactivate-person/deactivate-person.handler.js';
import { CreateTenantCommand } from '../create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../create-tenant/create-tenant.handler.js';
import { DeactivateTenantCommand } from '../deactivate-tenant/deactivate-tenant.command.js';
import { DeactivateTenantHandler } from '../deactivate-tenant/deactivate-tenant.handler.js';
import { MembershipAlreadyExistsError } from '../errors/membership-already-exists.error.js';
import { PersonInactiveError } from '../errors/person-inactive.error.js';
import { PersonNotFoundError } from '../errors/person-not-found.error.js';
import { TenantInactiveError } from '../errors/tenant-inactive.error.js';
import { TenantNotFoundError } from '../errors/tenant-not-found.error.js';
import { InMemoryMembershipRepository } from '../../infrastructure/repositories/in-memory-membership.repository.js';
import { InMemoryPersonRepository } from '../../infrastructure/repositories/in-memory-person.repository.js';
import { InMemoryTenantRepository } from '../../infrastructure/repositories/in-memory-tenant.repository.js';
import { AddPersonToTenantCommand } from './add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from './add-person-to-tenant.handler.js';
import { RemovePersonFromTenantCommand } from '../remove-person-from-tenant/remove-person-from-tenant.command.js';
import { RemovePersonFromTenantHandler } from '../remove-person-from-tenant/remove-person-from-tenant.handler.js';

const UNKNOWN_PERSON_ID = '550e8400-e29b-41d4-a716-446655440099';
const UNKNOWN_TENANT_ID = '550e8400-e29b-41d4-a716-446655440098';

async function seedPerson(repository = new InMemoryPersonRepository()) {
  const handler = new CreatePersonHandler(repository, noopEventDispatcher);
  const created = await handler.execute(
    new CreatePersonCommand({
      fullName: 'Maria Silva',
      email: 'maria.silva@example.com',
      documentType: DocumentType.PASSPORT,
      document: 'AB123456',
      birthDate: '1990-06-15',
    }),
  );

  return { repository, created };
}

async function seedTenant(repository = new InMemoryTenantRepository()) {
  const handler = new CreateTenantHandler(repository, noopEventDispatcher);
  const created = await handler.execute(
    new CreateTenantCommand({
      name: 'Portal Nutri Clinic',
      slug: 'portal-nutri-clinic',
    }),
  );

  return { repository, created };
}

function createHandler(
  membershipRepository = new InMemoryMembershipRepository(),
  personRepository = new InMemoryPersonRepository(),
  tenantRepository = new InMemoryTenantRepository(),
  eventDispatcher = noopEventDispatcher,
) {
  return new AddPersonToTenantHandler(
    membershipRepository,
    personRepository,
    tenantRepository,
    eventDispatcher,
  );
}

describe('AddPersonToTenantHandler', () => {
  it('creates a new active membership', async () => {
    const { repository: personRepository, created: person } = await seedPerson();
    const { repository: tenantRepository, created: tenant } = await seedTenant();
    const membershipRepository = new InMemoryMembershipRepository();
    const handler = createHandler(
      membershipRepository,
      personRepository,
      tenantRepository,
    );

    const response = await handler.execute(
      new AddPersonToTenantCommand({
        personId: person.id,
        tenantId: tenant.id,
      }),
    );

    assert.equal(response.personId, person.id);
    assert.equal(response.tenantId, tenant.id);
    assert.equal(response.status, MembershipStatus.Active);
    assert.equal(response.reactivatedAt, null);
    assert.equal(response.removedAt, null);
    assert.equal(response.operation, 'CREATED');
  });

  it('reactivates a removed membership without creating a second row', async () => {
    const { repository: personRepository, created: person } = await seedPerson();
    const { repository: tenantRepository, created: tenant } = await seedTenant();
    const membershipRepository = new InMemoryMembershipRepository();
    const handler = createHandler(
      membershipRepository,
      personRepository,
      tenantRepository,
    );

    const created = await handler.execute(
      new AddPersonToTenantCommand({
        personId: person.id,
        tenantId: tenant.id,
      }),
    );

    const removeHandler = new RemovePersonFromTenantHandler(
      membershipRepository,
      noopEventDispatcher,
    );

    await removeHandler.execute(
      new RemovePersonFromTenantCommand({
        personId: person.id,
        tenantId: tenant.id,
      }),
    );

    const reactivated = await handler.execute(
      new AddPersonToTenantCommand({
        personId: person.id,
        tenantId: tenant.id,
      }),
    );

    assert.equal(reactivated.id, created.id);
    assert.equal(reactivated.status, MembershipStatus.Active);
    assert.ok(reactivated.reactivatedAt);
    assert.equal(reactivated.removedAt, null);
    assert.equal(reactivated.operation, 'REACTIVATED');
  });

  it('rejects an already active membership', async () => {
    const { repository: personRepository, created: person } = await seedPerson();
    const { repository: tenantRepository, created: tenant } = await seedTenant();
    const membershipRepository = new InMemoryMembershipRepository();
    const handler = createHandler(
      membershipRepository,
      personRepository,
      tenantRepository,
    );

    await handler.execute(
      new AddPersonToTenantCommand({
        personId: person.id,
        tenantId: tenant.id,
      }),
    );

    await assert.rejects(
      () =>
        handler.execute(
          new AddPersonToTenantCommand({
            personId: person.id,
            tenantId: tenant.id,
          }),
        ),
      MembershipAlreadyExistsError,
    );
  });

  it('dispatches MembershipCreated after persistence', async () => {
    const { repository: personRepository, created: person } = await seedPerson();
    const { repository: tenantRepository, created: tenant } = await seedTenant();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = createHandler(
      new InMemoryMembershipRepository(),
      personRepository,
      tenantRepository,
      eventDispatcher,
    );

    await handler.execute(
      new AddPersonToTenantCommand({
        personId: person.id,
        tenantId: tenant.id,
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'MembershipCreated',
    );
  });

  it('throws PersonNotFoundError when person does not exist', async () => {
    const { repository: tenantRepository, created: tenant } = await seedTenant();
    const handler = createHandler(
      new InMemoryMembershipRepository(),
      new InMemoryPersonRepository(),
      tenantRepository,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new AddPersonToTenantCommand({
            personId: UNKNOWN_PERSON_ID,
            tenantId: tenant.id,
          }),
        ),
      PersonNotFoundError,
    );
  });

  it('throws PersonInactiveError when person is inactive', async () => {
    const { repository: personRepository, created: person } = await seedPerson();
    const { repository: tenantRepository, created: tenant } = await seedTenant();

    await new DeactivatePersonHandler(personRepository, noopEventDispatcher).execute(
      new DeactivatePersonCommand(person.id),
    );

    const handler = createHandler(
      new InMemoryMembershipRepository(),
      personRepository,
      tenantRepository,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new AddPersonToTenantCommand({
            personId: person.id,
            tenantId: tenant.id,
          }),
        ),
      PersonInactiveError,
    );
  });

  it('throws TenantNotFoundError when tenant does not exist', async () => {
    const { repository: personRepository, created: person } = await seedPerson();
    const handler = createHandler(
      new InMemoryMembershipRepository(),
      personRepository,
      new InMemoryTenantRepository(),
    );

    await assert.rejects(
      () =>
        handler.execute(
          new AddPersonToTenantCommand({
            personId: person.id,
            tenantId: UNKNOWN_TENANT_ID,
          }),
        ),
      TenantNotFoundError,
    );
  });

  it('throws TenantInactiveError when tenant is inactive', async () => {
    const { repository: personRepository, created: person } = await seedPerson();
    const { repository: tenantRepository, created: tenant } = await seedTenant();

    await new DeactivateTenantHandler(tenantRepository, noopEventDispatcher).execute(
      new DeactivateTenantCommand(tenant.id),
    );

    const handler = createHandler(
      new InMemoryMembershipRepository(),
      personRepository,
      tenantRepository,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new AddPersonToTenantCommand({
            personId: person.id,
            tenantId: tenant.id,
          }),
        ),
      TenantInactiveError,
    );
  });
});
