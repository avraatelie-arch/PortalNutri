import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../../iam/domain/value-objects/document.js';
import { NutritionistStatus } from '../../domain/value-objects/nutritionist-status.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { AddPersonToTenantCommand } from '../../../iam/application/add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../../../iam/application/add-person-to-tenant/add-person-to-tenant.handler.js';
import { CreatePersonCommand } from '../../../iam/application/create-person/create-person.command.js';
import { CreatePersonHandler } from '../../../iam/application/create-person/create-person.handler.js';
import { CreateTenantCommand } from '../../../iam/application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../../iam/application/create-tenant/create-tenant.handler.js';
import { MembershipInactiveError } from '../../../iam/application/errors/membership-inactive.error.js';
import { MembershipNotFoundError } from '../../../iam/application/errors/membership-not-found.error.js';
import { PersonNotFoundError } from '../../../iam/application/errors/person-not-found.error.js';
import { TenantNotFoundError } from '../../../iam/application/errors/tenant-not-found.error.js';
import { RemovePersonFromTenantCommand } from '../../../iam/application/remove-person-from-tenant/remove-person-from-tenant.command.js';
import { RemovePersonFromTenantHandler } from '../../../iam/application/remove-person-from-tenant/remove-person-from-tenant.handler.js';
import { InMemoryMembershipRepository } from '../../../iam/infrastructure/repositories/in-memory-membership.repository.js';
import { InMemoryPersonRepository } from '../../../iam/infrastructure/repositories/in-memory-person.repository.js';
import { InMemoryTenantRepository } from '../../../iam/infrastructure/repositories/in-memory-tenant.repository.js';
import { InMemoryNutritionistRepository } from '../../infrastructure/repositories/in-memory-nutritionist.repository.js';
import { NutritionistCrnAlreadyExistsError } from '../errors/nutritionist-crn-already-exists.error.js';
import { CreateNutritionistCommand } from './create-nutritionist.command.js';
import { CreateNutritionistHandler } from './create-nutritionist.handler.js';

const UNKNOWN_PERSON_ID = '550e8400-e29b-41d4-a716-446655440099';
const UNKNOWN_TENANT_ID = '550e8400-e29b-41d4-a716-446655440098';

async function seedActiveMembership() {
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

  await new AddPersonToTenantHandler(
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
    personRepository,
    tenantRepository,
    membershipRepository,
    person,
    tenant,
  };
}

function createHandler(deps: {
  nutritionistRepository?: InMemoryNutritionistRepository;
  personRepository: InMemoryPersonRepository;
  tenantRepository: InMemoryTenantRepository;
  membershipRepository: InMemoryMembershipRepository;
  eventDispatcher?: CapturingEventDispatcher;
}) {
  return new CreateNutritionistHandler(
    deps.nutritionistRepository ?? new InMemoryNutritionistRepository(),
    deps.personRepository,
    deps.tenantRepository,
    deps.membershipRepository,
    deps.eventDispatcher ?? noopEventDispatcher,
  );
}

describe('CreateNutritionistHandler', () => {
  it('creates a nutritionist when preconditions are met', async () => {
    const seeded = await seedActiveMembership();
    const handler = createHandler(seeded);

    const response = await handler.execute(
      new CreateNutritionistCommand({
        personId: seeded.person.id,
        tenantId: seeded.tenant.id,
        crn: '12345',
        stateCode: 'SP',
        specialty: 'Clinical Nutrition',
        bio: 'Experienced clinical nutritionist.',
      }),
    );

    assert.equal(response.personId, seeded.person.id);
    assert.equal(response.tenantId, seeded.tenant.id);
    assert.equal(response.crn, '12345');
    assert.equal(response.stateCode, 'SP');
    assert.equal(response.specialty, 'Clinical Nutrition');
    assert.equal(response.bio, 'Experienced clinical nutritionist.');
    assert.equal(response.status, NutritionistStatus.Active);
  });

  it('rejects duplicate CRN within the same tenant', async () => {
    const seeded = await seedActiveMembership();
    const nutritionistRepository = new InMemoryNutritionistRepository();
    const handler = createHandler({ ...seeded, nutritionistRepository });

    await handler.execute(
      new CreateNutritionistCommand({
        personId: seeded.person.id,
        tenantId: seeded.tenant.id,
        crn: '12345',
        stateCode: 'SP',
        specialty: 'Clinical Nutrition',
      }),
    );

    await assert.rejects(
      () =>
        handler.execute(
          new CreateNutritionistCommand({
            personId: seeded.person.id,
            tenantId: seeded.tenant.id,
            crn: '  12345  ',
            stateCode: 'RJ',
            specialty: 'Sports Nutrition',
          }),
        ),
      NutritionistCrnAlreadyExistsError,
    );
  });

  it('allows the same CRN in different tenants', async () => {
    const personRepository = new InMemoryPersonRepository();
    const tenantRepository = new InMemoryTenantRepository();
    const membershipRepository = new InMemoryMembershipRepository();
    const nutritionistRepository = new InMemoryNutritionistRepository();

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

    const tenantA = await new CreateTenantHandler(
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: 'Portal Nutri Clinic',
        slug: 'portal-nutri-clinic',
      }),
    );

    const tenantB = await new CreateTenantHandler(
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: 'Second Clinic',
        slug: 'second-clinic',
      }),
    );

    const addPersonHandler = new AddPersonToTenantHandler(
      membershipRepository,
      personRepository,
      tenantRepository,
      noopEventDispatcher,
    );

    await addPersonHandler.execute(
      new AddPersonToTenantCommand({
        personId: person.id,
        tenantId: tenantA.id,
      }),
    );

    await addPersonHandler.execute(
      new AddPersonToTenantCommand({
        personId: person.id,
        tenantId: tenantB.id,
      }),
    );

    const handler = createHandler({
      personRepository,
      tenantRepository,
      membershipRepository,
      nutritionistRepository,
    });

    await handler.execute(
      new CreateNutritionistCommand({
        personId: person.id,
        tenantId: tenantA.id,
        crn: '12345',
        stateCode: 'SP',
        specialty: 'Clinical Nutrition',
      }),
    );

    const second = await handler.execute(
      new CreateNutritionistCommand({
        personId: person.id,
        tenantId: tenantB.id,
        crn: '12345',
        stateCode: 'SP',
        specialty: 'Clinical Nutrition',
      }),
    );

    assert.equal(second.crn, '12345');
  });

  it('dispatches NutritionistCreated after persistence', async () => {
    const seeded = await seedActiveMembership();
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = createHandler({ ...seeded, eventDispatcher });

    await handler.execute(
      new CreateNutritionistCommand({
        personId: seeded.person.id,
        tenantId: seeded.tenant.id,
        crn: '12345',
        stateCode: 'SP',
        specialty: 'Clinical Nutrition',
      }),
    );

    assert.equal(eventDispatcher.dispatched.length, 1);
    assert.equal(
      (eventDispatcher.dispatched[0]?.[0] as { eventName: string }).eventName,
      'NutritionistCreated',
    );
  });

  it('throws PersonNotFoundError when person does not exist', async () => {
    const seeded = await seedActiveMembership();
    const handler = createHandler(seeded);

    await assert.rejects(
      () =>
        handler.execute(
          new CreateNutritionistCommand({
            personId: UNKNOWN_PERSON_ID,
            tenantId: seeded.tenant.id,
            crn: '12345',
            stateCode: 'SP',
            specialty: 'Clinical Nutrition',
          }),
        ),
      PersonNotFoundError,
    );
  });

  it('throws TenantNotFoundError when tenant does not exist', async () => {
    const seeded = await seedActiveMembership();
    const handler = createHandler(seeded);

    await assert.rejects(
      () =>
        handler.execute(
          new CreateNutritionistCommand({
            personId: seeded.person.id,
            tenantId: UNKNOWN_TENANT_ID,
            crn: '12345',
            stateCode: 'SP',
            specialty: 'Clinical Nutrition',
          }),
        ),
      TenantNotFoundError,
    );
  });

  it('throws MembershipNotFoundError when membership does not exist', async () => {
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

    const handler = createHandler({
      personRepository,
      tenantRepository,
      membershipRepository,
    });

    await assert.rejects(
      () =>
        handler.execute(
          new CreateNutritionistCommand({
            personId: person.id,
            tenantId: tenant.id,
            crn: '12345',
            stateCode: 'SP',
            specialty: 'Clinical Nutrition',
          }),
        ),
      MembershipNotFoundError,
    );
  });

  it('throws MembershipInactiveError when membership is removed', async () => {
    const seeded = await seedActiveMembership();

    await new RemovePersonFromTenantHandler(
      seeded.membershipRepository,
      noopEventDispatcher,
    ).execute(
      new RemovePersonFromTenantCommand({
        personId: seeded.person.id,
        tenantId: seeded.tenant.id,
      }),
    );

    const handler = createHandler(seeded);

    await assert.rejects(
      () =>
        handler.execute(
          new CreateNutritionistCommand({
            personId: seeded.person.id,
            tenantId: seeded.tenant.id,
            crn: '12345',
            stateCode: 'SP',
            specialty: 'Clinical Nutrition',
          }),
        ),
      MembershipInactiveError,
    );
  });
});
