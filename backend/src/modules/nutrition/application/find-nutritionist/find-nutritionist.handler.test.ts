import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DocumentType } from '../../../iam/domain/value-objects/document.js';
import { NutritionistStatus } from '../../domain/value-objects/nutritionist-status.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { AddPersonToTenantCommand } from '../../../iam/application/add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../../../iam/application/add-person-to-tenant/add-person-to-tenant.handler.js';
import { CreatePersonCommand } from '../../../iam/application/create-person/create-person.command.js';
import { CreatePersonHandler } from '../../../iam/application/create-person/create-person.handler.js';
import { CreateTenantCommand } from '../../../iam/application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../../iam/application/create-tenant/create-tenant.handler.js';
import { InMemoryMembershipRepository } from '../../../iam/infrastructure/repositories/in-memory-membership.repository.js';
import { InMemoryPersonRepository } from '../../../iam/infrastructure/repositories/in-memory-person.repository.js';
import { InMemoryTenantRepository } from '../../../iam/infrastructure/repositories/in-memory-tenant.repository.js';
import { InMemoryNutritionistRepository } from '../../infrastructure/repositories/in-memory-nutritionist.repository.js';
import { NutritionistNotFoundError } from '../errors/nutritionist-not-found.error.js';
import { CreateNutritionistCommand } from '../create-nutritionist/create-nutritionist.command.js';
import { CreateNutritionistHandler } from '../create-nutritionist/create-nutritionist.handler.js';
import { FindNutritionistHandler } from './find-nutritionist.handler.js';
import { FindNutritionistQuery } from './find-nutritionist.query.js';

const UNKNOWN_NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440099';

async function seedNutritionist() {
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

  const nutritionist = await new CreateNutritionistHandler(
    nutritionistRepository,
    personRepository,
    tenantRepository,
    membershipRepository,
    noopEventDispatcher,
  ).execute(
    new CreateNutritionistCommand({
      personId: person.id,
      tenantId: tenant.id,
      crn: '12345',
      stateCode: 'SP',
      specialty: 'Clinical Nutrition',
      bio: 'Focused on sports nutrition.',
    }),
  );

  return { nutritionistRepository, nutritionist };
}

describe('FindNutritionistHandler', () => {
  it('finds a nutritionist by id', async () => {
    const { nutritionistRepository, nutritionist } = await seedNutritionist();
    const handler = new FindNutritionistHandler(nutritionistRepository);

    const result = await handler.execute(
      new FindNutritionistQuery(nutritionist.id),
    );

    assert.equal(result.id, nutritionist.id);
    assert.equal(result.personId, nutritionist.personId);
    assert.equal(result.tenantId, nutritionist.tenantId);
    assert.equal(result.crn, '12345');
    assert.equal(result.stateCode, 'SP');
    assert.equal(result.specialty, 'Clinical Nutrition');
    assert.equal(result.bio, 'Focused on sports nutrition.');
    assert.equal(result.status, NutritionistStatus.Active);
  });

  it('throws NutritionistNotFoundError when nutritionist does not exist', async () => {
    const handler = new FindNutritionistHandler(
      new InMemoryNutritionistRepository(),
    );

    await assert.rejects(
      () => handler.execute(new FindNutritionistQuery(UNKNOWN_NUTRITIONIST_ID)),
      NutritionistNotFoundError,
    );
  });
});
