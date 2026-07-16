import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import { AddPersonToTenantCommand } from '../../../iam/application/add-person-to-tenant/add-person-to-tenant.command.js';
import { AddPersonToTenantHandler } from '../../../iam/application/add-person-to-tenant/add-person-to-tenant.handler.js';
import { CreatePersonCommand } from '../../../iam/application/create-person/create-person.command.js';
import { CreatePersonHandler } from '../../../iam/application/create-person/create-person.handler.js';
import { CreateTenantCommand } from '../../../iam/application/create-tenant/create-tenant.command.js';
import { CreateTenantHandler } from '../../../iam/application/create-tenant/create-tenant.handler.js';
import { DocumentType } from '../../../iam/domain/value-objects/document.js';
import { PersonId } from '../../../iam/domain/value-objects/person-id.js';
import { TenantId } from '../../../iam/domain/value-objects/tenant-id.js';
import { PrismaMembershipRepository } from '../../../iam/infrastructure/repositories/prisma-membership.repository.js';
import { PrismaPersonRepository } from '../../../iam/infrastructure/repositories/prisma-person.repository.js';
import { PrismaTenantRepository } from '../../../iam/infrastructure/repositories/prisma-tenant.repository.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CreateNutritionistCommand } from '../../application/create-nutritionist/create-nutritionist.command.js';
import { CreateNutritionistHandler } from '../../application/create-nutritionist/create-nutritionist.handler.js';
import { FindNutritionistQuery } from '../../application/find-nutritionist/find-nutritionist.query.js';
import { FindNutritionistHandler } from '../../application/find-nutritionist/find-nutritionist.handler.js';
import { Crn } from '../../domain/value-objects/crn.js';
import { NutritionistId } from '../../domain/value-objects/nutritionist-id.js';
import { NutritionistStatus } from '../../domain/value-objects/nutritionist-status.js';
import { PrismaNutritionistRepository } from './prisma-nutritionist.repository.js';

requireDatabaseUrl();

const prisma = new PrismaClient();
const repository = new PrismaNutritionistRepository(prisma);
const personRepository = new PrismaPersonRepository(prisma);
const tenantRepository = new PrismaTenantRepository(prisma);
const membershipRepository = new PrismaMembershipRepository(prisma);

async function resetNutritionists() {
  await prisma.nutritionist.deleteMany();
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

async function createNutritionistFixture() {
  const person = await new CreatePersonHandler(
    personRepository,
    noopEventDispatcher,
  ).execute(
    new CreatePersonCommand({
      fullName: 'Ana Nutricionista',
      email: 'ana.nutritionist@example.com',
      documentType: DocumentType.PASSPORT,
      document: 'NU123456',
      birthDate: '1988-03-20',
    }),
  );

  const tenant = await new CreateTenantHandler(
    tenantRepository,
    noopEventDispatcher,
  ).execute(
    new CreateTenantCommand({
      name: 'Nutrition Clinic',
      slug: 'nutrition-clinic',
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

  return { person, tenant };
}

describe('PrismaNutritionistRepository (integration)', () => {
  before(async () => {
    await resetNutritionists();
  });

  beforeEach(async () => {
    await resetNutritionists();
  });

  after(async () => {
    await resetNutritionists();
    await prisma.$disconnect();
  });

  it('persists and finds a nutritionist by id', async () => {
    const { person, tenant } = await createNutritionistFixture();
    const createHandler = new CreateNutritionistHandler(
      repository,
      personRepository,
      tenantRepository,
      membershipRepository,
      noopEventDispatcher,
    );
    const findHandler = new FindNutritionistHandler(repository);

    const created = await createHandler.execute(
      new CreateNutritionistCommand({
        personId: person.id,
        tenantId: tenant.id,
        crn: 'CRN-12345',
        stateCode: 'SP',
        specialty: 'Clinical Nutrition',
        bio: 'Experienced clinical nutritionist.',
      }),
    );

    const found = await findHandler.execute(
      new FindNutritionistQuery(created.id),
    );

    assert.equal(found.id, created.id);
    assert.equal(found.personId, person.id);
    assert.equal(found.tenantId, tenant.id);
    assert.equal(found.crn, 'CRN-12345');
    assert.equal(found.stateCode, 'SP');
    assert.equal(found.specialty, 'Clinical Nutrition');
    assert.equal(found.bio, 'Experienced clinical nutritionist.');
    assert.equal(found.status, NutritionistStatus.Active);
  });

  it('reports CRN existence within a tenant', async () => {
    const { person, tenant } = await createNutritionistFixture();
    const createHandler = new CreateNutritionistHandler(
      repository,
      personRepository,
      tenantRepository,
      membershipRepository,
      noopEventDispatcher,
    );

    await createHandler.execute(
      new CreateNutritionistCommand({
        personId: person.id,
        tenantId: tenant.id,
        crn: 'CRN-67890',
        stateCode: 'RJ',
        specialty: 'Sports Nutrition',
      }),
    );

    assert.equal(
      await repository.existsByCrn(
        TenantId.create(tenant.id),
        Crn.create('CRN-67890'),
      ),
      true,
    );
    assert.equal(
      await repository.existsByCrn(
        TenantId.create(tenant.id),
        Crn.create('CRN-MISSING'),
      ),
      false,
    );
  });

  it('finds a nutritionist by person and tenant', async () => {
    const { person, tenant } = await createNutritionistFixture();
    const createHandler = new CreateNutritionistHandler(
      repository,
      personRepository,
      tenantRepository,
      membershipRepository,
      noopEventDispatcher,
    );

    const created = await createHandler.execute(
      new CreateNutritionistCommand({
        personId: person.id,
        tenantId: tenant.id,
        crn: 'CRN-PERSON',
        stateCode: 'MG',
        specialty: 'Pediatric Nutrition',
      }),
    );

    const found = await repository.findByPersonAndTenant(
      PersonId.create(person.id),
      TenantId.create(tenant.id),
    );

    assert.ok(found);
    assert.equal(found.getId().toString(), created.id);
    assert.equal(found.getPersonId().toString(), person.id);
    assert.equal(found.getTenantId().toString(), tenant.id);
    assert.equal(found.getCrn().toString(), 'CRN-PERSON');
  });

  it('scopes findByPersonAndTenant to the requested tenant', async () => {
    const { person, tenant } = await createNutritionistFixture();
    const otherTenant = await new CreateTenantHandler(
      tenantRepository,
      noopEventDispatcher,
    ).execute(
      new CreateTenantCommand({
        name: 'Other Nutrition Clinic',
        slug: 'other-nutrition-clinic',
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
        tenantId: otherTenant.id,
      }),
    );

    const createHandler = new CreateNutritionistHandler(
      repository,
      personRepository,
      tenantRepository,
      membershipRepository,
      noopEventDispatcher,
    );

    const primaryNutritionist = await createHandler.execute(
      new CreateNutritionistCommand({
        personId: person.id,
        tenantId: tenant.id,
        crn: 'CRN-TENANT-A',
        stateCode: 'SP',
        specialty: 'Clinical Nutrition',
      }),
    );

    const otherNutritionist = await createHandler.execute(
      new CreateNutritionistCommand({
        personId: person.id,
        tenantId: otherTenant.id,
        crn: 'CRN-TENANT-B',
        stateCode: 'RJ',
        specialty: 'Sports Nutrition',
      }),
    );

    const foundInPrimaryTenant = await repository.findByPersonAndTenant(
      PersonId.create(person.id),
      TenantId.create(tenant.id),
    );
    const foundInOtherTenant = await repository.findByPersonAndTenant(
      PersonId.create(person.id),
      TenantId.create(otherTenant.id),
    );

    assert.ok(foundInPrimaryTenant);
    assert.ok(foundInOtherTenant);
    assert.equal(foundInPrimaryTenant.getId().toString(), primaryNutritionist.id);
    assert.equal(foundInOtherTenant.getId().toString(), otherNutritionist.id);
    assert.equal(foundInPrimaryTenant.getCrn().toString(), 'CRN-TENANT-A');
    assert.equal(foundInOtherTenant.getCrn().toString(), 'CRN-TENANT-B');
  });

  it('returns null when nutritionist does not exist', async () => {
    const found = await repository.findById(
      NutritionistId.create('550e8400-e29b-41d4-a716-446655440099'),
    );

    assert.equal(found, null);
  });
});
