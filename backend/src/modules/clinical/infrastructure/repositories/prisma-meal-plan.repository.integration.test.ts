import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import {
  createClinicalIntegrationEncounterHandlers,
  resetClinicalIntegrationDatabase,
  seedClinicalIntegrationBase,
  seedClinicalIntegrationDraftAnamnesisContext,
  type ClinicalIntegrationDraftAnamnesisContext,
  type ClinicalIntegrationFixtureSeed,
} from '../../../../test-support/clinical-integration-fixture.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { ActivateMealPlanCommand } from '../../application/activate-meal-plan/activate-meal-plan.command.js';
import { ActivateMealPlanHandler } from '../../application/activate-meal-plan/activate-meal-plan.handler.js';
import { CreateMealPlanCommand } from '../../application/create-meal-plan/create-meal-plan.command.js';
import { CreateMealPlanHandler } from '../../application/create-meal-plan/create-meal-plan.handler.js';
import { FindActiveMealPlansByPatientQuery } from '../../application/find-active-meal-plans-by-patient/find-active-meal-plans-by-patient.query.js';
import { FindActiveMealPlansByPatientHandler } from '../../application/find-active-meal-plans-by-patient/find-active-meal-plans-by-patient.handler.js';
import { FindMealPlanQuery } from '../../application/find-meal-plan/find-meal-plan.query.js';
import { FindMealPlanHandler } from '../../application/find-meal-plan/find-meal-plan.handler.js';
import { FindMealPlansByPatientQuery } from '../../application/find-meal-plans-by-patient/find-meal-plans-by-patient.query.js';
import { FindMealPlansByPatientHandler } from '../../application/find-meal-plans-by-patient/find-meal-plans-by-patient.handler.js';
import { MealPlanId } from '../../domain/value-objects/meal-plan-id.js';
import { MealPlanStatusValue } from '../../domain/value-objects/meal-plan-status.js';
import { PrismaMembershipRepository } from '../../../iam/infrastructure/repositories/prisma-membership.repository.js';
import { PrismaPersonRepository } from '../../../iam/infrastructure/repositories/prisma-person.repository.js';
import { PrismaTenantRepository } from '../../../iam/infrastructure/repositories/prisma-tenant.repository.js';
import { PrismaNutritionistRepository } from '../../../nutrition/infrastructure/repositories/prisma-nutritionist.repository.js';
import { PrismaNutritionistDirectoryAdapter } from '../../../patient/infrastructure/adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaPatientRepository } from '../../../patient/infrastructure/repositories/prisma-patient.repository.js';
import { PrismaPatientNutritionistAssignmentRepository } from '../../../patient/infrastructure/repositories/prisma-patient-nutritionist-assignment.repository.js';
import { PrismaAnamnesisDirectoryAdapter } from '../adapters/prisma-anamnesis-directory.adapter.js';
import { PrismaAppointmentDirectoryAdapter } from '../adapters/prisma-appointment-directory.adapter.js';
import { PrismaClinicalEncounterDirectoryAdapter } from '../adapters/prisma-clinical-encounter-directory.adapter.js';
import { PrismaNutritionistDirectoryAdapter as ClinicalNutritionistDirectoryAdapter } from '../adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaPatientClinicalDirectoryAdapter } from '../adapters/prisma-patient-clinical-directory.adapter.js';
import { PrismaPatientDirectoryAdapter } from '../adapters/prisma-patient-directory.adapter.js';
import { PrismaTenantDirectoryAdapter } from '../adapters/prisma-tenant-directory.adapter.js';
import { PrismaClinicalEncounterRepository } from './prisma-clinical-encounter.repository.js';
import { PrismaAnamnesisRepository } from './prisma-anamnesis.repository.js';
import { PrismaMealPlanRepository } from './prisma-meal-plan.repository.js';

requireDatabaseUrl();

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');

const prisma = new PrismaClient();
const encounterRepository = new PrismaClinicalEncounterRepository(prisma);
const anamnesisRepository = new PrismaAnamnesisRepository(prisma);
const mealPlanRepository = new PrismaMealPlanRepository(prisma);
const tenantRepository = new PrismaTenantRepository(prisma);
const personRepository = new PrismaPersonRepository(prisma);
const membershipRepository = new PrismaMembershipRepository(prisma);
const nutritionistRepository = new PrismaNutritionistRepository(prisma);
const patientRepository = new PrismaPatientRepository(prisma);
const assignmentRepository = new PrismaPatientNutritionistAssignmentRepository(prisma);

const patientNutritionistDirectory = new PrismaNutritionistDirectoryAdapter(prisma);
const clinicalTenantDirectory = new PrismaTenantDirectoryAdapter(prisma);
const clinicalPatientDirectory = new PrismaPatientDirectoryAdapter(prisma);
const clinicalNutritionistDirectory = new ClinicalNutritionistDirectoryAdapter(prisma);
const clinicalAppointmentDirectory = new PrismaAppointmentDirectoryAdapter(prisma);
const clinicalEncounterDirectory = new PrismaClinicalEncounterDirectoryAdapter(prisma);
const anamnesisDirectory = new PrismaAnamnesisDirectoryAdapter(prisma);
const patientClinicalDirectory = new PrismaPatientClinicalDirectoryAdapter(prisma);

const clock = new FixedClock(NOW);
const laterClock = new FixedClock(LATER);

const fixtureRepositories = {
  prisma,
  tenantRepository,
  personRepository,
  membershipRepository,
  nutritionistRepository,
  patientRepository,
  assignmentRepository,
  encounterRepository,
  anamnesisRepository,
};

const fixtureDirectories = {
  patientNutritionistDirectory,
  clinicalTenantDirectory,
  clinicalPatientDirectory,
  clinicalNutritionistDirectory,
  clinicalAppointmentDirectory,
  clinicalEncounterDirectory,
  anamnesisDirectory,
};

const encounterHandlers = createClinicalIntegrationEncounterHandlers(
  fixtureRepositories,
  fixtureDirectories,
  clock,
  noopEventDispatcher,
);

function createHandler(customClock = clock) {
  return new CreateMealPlanHandler(
    mealPlanRepository,
    clinicalTenantDirectory,
    patientClinicalDirectory,
    clinicalNutritionistDirectory,
    clinicalEncounterDirectory,
    anamnesisDirectory,
    customClock,
    noopEventDispatcher,
  );
}

function createCommand(
  fixture: ClinicalIntegrationFixtureSeed,
  context: ClinicalIntegrationDraftAnamnesisContext,
  overrides?: Partial<CreateMealPlanCommand['request']>,
) {
  return new CreateMealPlanCommand({
    tenantId: fixture.tenant.id,
    patientId: fixture.patient.id,
    createdByNutritionistId: fixture.nutritionist.id,
    responsibleNutritionistId: fixture.nutritionist.id,
    originClinicalEncounterId: context.encounter.id,
    originAnamnesisId: context.anamnesis.id,
    planType: 'INITIAL',
    title: 'Weight management plan',
    therapeuticStrategy: 'Moderate caloric deficit with protein prioritization.',
    meals: [
      {
        sortOrder: 1,
        name: 'Breakfast',
        scheduledTime: '07:30',
        content: 'Oats with fruit and yogurt.',
      },
    ],
    ...overrides,
  });
}

async function createFixture(slugSuffix?: string) {
  return seedClinicalIntegrationBase(
    fixtureRepositories,
    fixtureDirectories,
    noopEventDispatcher,
    {
      slug: slugSuffix ?? `meal-plan-${Date.now()}`,
      emailPrefix: 'meal.plan',
      tenantName: 'Meal Plan Clinic',
    },
  );
}

describe('PrismaMealPlanRepository (integration)', () => {
  before(async () => {
    await resetClinicalIntegrationDatabase(prisma, { includeAssessments: true });
  });

  beforeEach(async () => {
    await resetClinicalIntegrationDatabase(prisma, { includeAssessments: true });
  });

  after(async () => {
    await resetClinicalIntegrationDatabase(prisma, { includeAssessments: true });
    await prisma.$disconnect();
  });

  it('persists and finds a meal plan by tenant and id', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const createHandlerInstance = createHandler();
    const findHandler = new FindMealPlanHandler(mealPlanRepository);

    const created = await createHandlerInstance.execute(createCommand(fixture, context));

    const found = await findHandler.execute(
      new FindMealPlanQuery({
        tenantId: fixture.tenant.id,
        mealPlanId: created.id,
      }),
    );

    assert.equal(found.id, created.id);
    assert.equal(found.status, MealPlanStatusValue.Draft);
    assert.equal(found.planType, 'INITIAL');
    assert.equal(found.originClinicalEncounterId, context.encounter.id);
    assert.equal(found.originAnamnesisId, context.anamnesis.id);
    assert.equal(found.meals.length, 1);
    assert.equal(found.meals[0]?.content, 'Oats with fruit and yogurt.');
  });

  it('scopes findByTenantAndId to tenant', async () => {
    const fixtureOne = await createFixture(`mp-scope-a-${Date.now()}`);
    const fixtureTwo = await createFixture(`mp-scope-b-${Date.now() + 1}`);
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixtureOne,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixtureOne, context));

    const crossTenant = await mealPlanRepository.findByTenantAndId(
      fixtureTwo.tenant.id,
      MealPlanId.create(created.id),
    );

    assert.equal(crossTenant, null);
  });

  it('stores lifecycle timestamps after activation', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));
    const activateHandler = new ActivateMealPlanHandler(
      mealPlanRepository,
      laterClock,
      noopEventDispatcher,
    );

    const activated = await activateHandler.execute(
      new ActivateMealPlanCommand({
        tenantId: fixture.tenant.id,
        mealPlanId: created.id,
      }),
    );

    assert.equal(activated.status, MealPlanStatusValue.Active);
    assert.equal(activated.activatedAt, LATER.toISOString());
    assert.equal(activated.version, 2);

    const row = await prisma.mealPlan.findUnique({ where: { id: created.id } });
    assert.ok(row?.activatedAt);
  });

  it('maintains foreign key integrity with origin references', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));

    const row = await prisma.mealPlan.findUnique({ where: { id: created.id } });

    assert.ok(row);
    assert.equal(row.originClinicalEncounterId, context.encounter.id);
    assert.equal(row.originAnamnesisId, context.anamnesis.id);
    assert.equal(row.patientId, fixture.patient.id);
    assert.equal(row.createdByNutritionistId, fixture.nutritionist.id);
  });

  it('finds meal plans by status', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));
    await new ActivateMealPlanHandler(
      mealPlanRepository,
      laterClock,
      noopEventDispatcher,
    ).execute(
      new ActivateMealPlanCommand({
        tenantId: fixture.tenant.id,
        mealPlanId: created.id,
      }),
    );

    const draftResults = await mealPlanRepository.findByStatus(
      fixture.tenant.id,
      MealPlanStatusValue.Draft,
    );
    const activeResults = await mealPlanRepository.findByStatus(
      fixture.tenant.id,
      MealPlanStatusValue.Active,
    );

    assert.equal(draftResults.length, 0);
    assert.equal(activeResults.length, 1);
    assert.equal(activeResults[0]?.getId().toString(), created.id);
  });

  it('finds active meal plans by patient through query handler', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));
    await new ActivateMealPlanHandler(
      mealPlanRepository,
      laterClock,
      noopEventDispatcher,
    ).execute(
      new ActivateMealPlanCommand({
        tenantId: fixture.tenant.id,
        mealPlanId: created.id,
      }),
    );

    const findHandler = new FindActiveMealPlansByPatientHandler(mealPlanRepository);
    const results = await findHandler.execute(
      new FindActiveMealPlansByPatientQuery({
        tenantId: fixture.tenant.id,
        patientId: fixture.patient.id,
      }),
    );

    assert.equal(results.length, 1);
    assert.equal(results[0]?.id, created.id);
  });

  it('findLatestByPatient returns most recent by effective date', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );

    const older = await createHandler(clock).execute(createCommand(fixture, context));
    await new ActivateMealPlanHandler(
      mealPlanRepository,
      clock,
      noopEventDispatcher,
    ).execute(
      new ActivateMealPlanCommand({
        tenantId: fixture.tenant.id,
        mealPlanId: older.id,
      }),
    );

    const newer = await createHandler(laterClock).execute(
      createCommand(fixture, context, {
        planType: 'MAINTENANCE',
        title: 'Maintenance plan',
        therapeuticStrategy: 'Maintenance strategy text.',
      }),
    );

    const latest = await mealPlanRepository.findLatestByPatient(
      fixture.tenant.id,
      fixture.patient.id,
    );

    assert.ok(latest);
    assert.equal(latest.getId().toString(), newer.id);
  });

  it('filters patient meal plans by status in query handler', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));

    const findHandler = new FindMealPlansByPatientHandler(mealPlanRepository);
    const draftResults = await findHandler.execute(
      new FindMealPlansByPatientQuery({
        tenantId: fixture.tenant.id,
        patientId: fixture.patient.id,
        status: MealPlanStatusValue.Draft,
      }),
    );

    assert.equal(draftResults.length, 1);
    assert.equal(draftResults[0]?.id, created.id);
  });

  it('updates version and timestamps on persistence round-trip', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));
    const activated = await new ActivateMealPlanHandler(
      mealPlanRepository,
      laterClock,
      noopEventDispatcher,
    ).execute(
      new ActivateMealPlanCommand({
        tenantId: fixture.tenant.id,
        mealPlanId: created.id,
      }),
    );

    const reloaded = await mealPlanRepository.findByTenantAndId(
      fixture.tenant.id,
      MealPlanId.create(created.id),
    );

    assert.ok(reloaded);
    assert.equal(reloaded.getVersion(), activated.version);
    assert.equal(reloaded.getUpdatedAt().toISOString(), LATER.toISOString());
    assert.equal(reloaded.getMeals().length, 1);
  });

  it('allows meal plans without origin references', async () => {
    const fixture = await createFixture();
    const created = await createHandler().execute(
      new CreateMealPlanCommand({
        tenantId: fixture.tenant.id,
        patientId: fixture.patient.id,
        createdByNutritionistId: fixture.nutritionist.id,
        responsibleNutritionistId: fixture.nutritionist.id,
        planType: 'OTHER',
        title: 'Standalone meal plan',
        therapeuticStrategy: 'Standalone strategy text.',
      }),
    );

    assert.equal(created.originClinicalEncounterId, null);
    assert.equal(created.originAnamnesisId, null);

    const row = await prisma.mealPlan.findUnique({ where: { id: created.id } });
    assert.ok(row);
    assert.equal(row.originClinicalEncounterId, null);
    assert.equal(row.originAnamnesisId, null);
  });
});
