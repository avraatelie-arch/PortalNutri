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
import { ActivateClinicalObjectiveCommand } from '../../application/activate-clinical-objective/activate-clinical-objective.command.js';
import { ActivateClinicalObjectiveHandler } from '../../application/activate-clinical-objective/activate-clinical-objective.handler.js';
import { CreateClinicalObjectiveCommand } from '../../application/create-clinical-objective/create-clinical-objective.command.js';
import { CreateClinicalObjectiveHandler } from '../../application/create-clinical-objective/create-clinical-objective.handler.js';
import { FindActiveClinicalObjectivesByPatientQuery } from '../../application/find-active-clinical-objectives-by-patient/find-active-clinical-objectives-by-patient.query.js';
import { FindActiveClinicalObjectivesByPatientHandler } from '../../application/find-active-clinical-objectives-by-patient/find-active-clinical-objectives-by-patient.handler.js';
import { FindClinicalObjectiveQuery } from '../../application/find-clinical-objective/find-clinical-objective.query.js';
import { FindClinicalObjectiveHandler } from '../../application/find-clinical-objective/find-clinical-objective.handler.js';
import { FindClinicalObjectivesByPatientQuery } from '../../application/find-clinical-objectives-by-patient/find-clinical-objectives-by-patient.query.js';
import { FindClinicalObjectivesByPatientHandler } from '../../application/find-clinical-objectives-by-patient/find-clinical-objectives-by-patient.handler.js';
import { ClinicalObjectiveId } from '../../domain/value-objects/clinical-objective-id.js';
import { ClinicalObjectivePriorityValue } from '../../domain/value-objects/clinical-objective-priority.js';
import { ClinicalObjectiveStatusValue } from '../../domain/value-objects/clinical-objective-status.js';
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
import { PrismaClinicalObjectiveRepository } from './prisma-clinical-objective.repository.js';

requireDatabaseUrl();

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');

const prisma = new PrismaClient();
const encounterRepository = new PrismaClinicalEncounterRepository(prisma);
const anamnesisRepository = new PrismaAnamnesisRepository(prisma);
const clinicalObjectiveRepository = new PrismaClinicalObjectiveRepository(prisma);
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
  return new CreateClinicalObjectiveHandler(
    clinicalObjectiveRepository,
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
  overrides?: Partial<CreateClinicalObjectiveCommand['request']>,
) {
  return new CreateClinicalObjectiveCommand({
    tenantId: fixture.tenant.id,
    patientId: fixture.patient.id,
    createdByNutritionistId: fixture.nutritionist.id,
    responsibleNutritionistId: fixture.nutritionist.id,
    originClinicalEncounterId: context.encounter.id,
    originAnamnesisId: context.anamnesis.id,
    type: 'WEIGHT_LOSS',
    title: 'Lose 5kg in 3 months',
    targetDate: new Date('2026-12-31T00:00:00.000Z'),
    ...overrides,
  });
}

async function createFixture(slugSuffix?: string) {
  return seedClinicalIntegrationBase(
    fixtureRepositories,
    fixtureDirectories,
    noopEventDispatcher,
    {
      slug: slugSuffix ?? `clinical-objective-${Date.now()}`,
      emailPrefix: 'clinical.objective',
      tenantName: 'Clinical Objective Clinic',
    },
  );
}

describe('PrismaClinicalObjectiveRepository (integration)', () => {
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

  it('persists and finds a clinical objective by tenant and id', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const createHandlerInstance = createHandler();
    const findHandler = new FindClinicalObjectiveHandler(clinicalObjectiveRepository);

    const created = await createHandlerInstance.execute(createCommand(fixture, context));

    const found = await findHandler.execute(
      new FindClinicalObjectiveQuery({
        tenantId: fixture.tenant.id,
        clinicalObjectiveId: created.id,
      }),
    );

    assert.equal(found.id, created.id);
    assert.equal(found.status, ClinicalObjectiveStatusValue.Draft);
    assert.equal(found.title, 'Lose 5kg in 3 months');
    assert.equal(found.originClinicalEncounterId, context.encounter.id);
    assert.equal(found.originAnamnesisId, context.anamnesis.id);
  });

  it('scopes findByTenantAndId to tenant', async () => {
    const fixtureOne = await createFixture(`co-scope-a-${Date.now()}`);
    const fixtureTwo = await createFixture(`co-scope-b-${Date.now() + 1}`);
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixtureOne,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixtureOne, context));

    const crossTenant = await clinicalObjectiveRepository.findByTenantAndId(
      fixtureTwo.tenant.id,
      ClinicalObjectiveId.create(created.id),
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
    const activateHandler = new ActivateClinicalObjectiveHandler(
      clinicalObjectiveRepository,
      laterClock,
      noopEventDispatcher,
    );

    const activated = await activateHandler.execute(
      new ActivateClinicalObjectiveCommand({
        tenantId: fixture.tenant.id,
        clinicalObjectiveId: created.id,
      }),
    );

    assert.equal(activated.status, ClinicalObjectiveStatusValue.Active);
    assert.equal(activated.activatedAt, LATER.toISOString());
    assert.equal(activated.version, 2);

    const row = await prisma.clinicalObjective.findUnique({ where: { id: created.id } });
    assert.ok(row?.activatedAt);
  });

  it('maintains foreign key integrity with origin references', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));

    const row = await prisma.clinicalObjective.findUnique({ where: { id: created.id } });

    assert.ok(row);
    assert.equal(row.originClinicalEncounterId, context.encounter.id);
    assert.equal(row.originAnamnesisId, context.anamnesis.id);
    assert.equal(row.patientId, fixture.patient.id);
    assert.equal(row.createdByNutritionistId, fixture.nutritionist.id);
  });

  it('finds objectives by status', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));
    await new ActivateClinicalObjectiveHandler(
      clinicalObjectiveRepository,
      laterClock,
      noopEventDispatcher,
    ).execute(
      new ActivateClinicalObjectiveCommand({
        tenantId: fixture.tenant.id,
        clinicalObjectiveId: created.id,
      }),
    );

    const draftResults = await clinicalObjectiveRepository.findByStatus(
      fixture.tenant.id,
      ClinicalObjectiveStatusValue.Draft,
    );
    const activeResults = await clinicalObjectiveRepository.findByStatus(
      fixture.tenant.id,
      ClinicalObjectiveStatusValue.Active,
    );

    assert.equal(draftResults.length, 0);
    assert.equal(activeResults.length, 1);
    assert.equal(activeResults[0]?.getId().toString(), created.id);
  });

  it('finds active objectives by patient through query handler', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));
    await new ActivateClinicalObjectiveHandler(
      clinicalObjectiveRepository,
      laterClock,
      noopEventDispatcher,
    ).execute(
      new ActivateClinicalObjectiveCommand({
        tenantId: fixture.tenant.id,
        clinicalObjectiveId: created.id,
      }),
    );

    const findHandler = new FindActiveClinicalObjectivesByPatientHandler(
      clinicalObjectiveRepository,
    );
    const results = await findHandler.execute(
      new FindActiveClinicalObjectivesByPatientQuery({
        tenantId: fixture.tenant.id,
        patientId: fixture.patient.id,
      }),
    );

    assert.equal(results.length, 1);
    assert.equal(results[0]?.id, created.id);
  });

  it('orders objectives by priority with CRITICAL first', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );

    const low = await createHandler().execute(
      createCommand(fixture, context, {
        priority: ClinicalObjectivePriorityValue.Low,
        title: 'Low priority',
      }),
    );
    const critical = await createHandler(laterClock).execute(
      createCommand(fixture, context, {
        priority: ClinicalObjectivePriorityValue.Critical,
        title: 'Critical priority',
      }),
    );

    const findHandler = new FindClinicalObjectivesByPatientHandler(
      clinicalObjectiveRepository,
    );
    const results = await findHandler.execute(
      new FindClinicalObjectivesByPatientQuery({
        tenantId: fixture.tenant.id,
        patientId: fixture.patient.id,
      }),
    );

    assert.equal(results.length, 2);
    assert.equal(results[0]?.id, critical.id);
    assert.equal(results[1]?.id, low.id);
  });

  it('filters patient objectives by status in query handler', async () => {
    const fixture = await createFixture();
    const context = await seedClinicalIntegrationDraftAnamnesisContext(
      fixture,
      encounterHandlers,
    );
    const created = await createHandler().execute(createCommand(fixture, context));

    const findHandler = new FindClinicalObjectivesByPatientHandler(
      clinicalObjectiveRepository,
    );
    const draftResults = await findHandler.execute(
      new FindClinicalObjectivesByPatientQuery({
        tenantId: fixture.tenant.id,
        patientId: fixture.patient.id,
        status: ClinicalObjectiveStatusValue.Draft,
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
    const activated = await new ActivateClinicalObjectiveHandler(
      clinicalObjectiveRepository,
      laterClock,
      noopEventDispatcher,
    ).execute(
      new ActivateClinicalObjectiveCommand({
        tenantId: fixture.tenant.id,
        clinicalObjectiveId: created.id,
      }),
    );

    const reloaded = await clinicalObjectiveRepository.findByTenantAndId(
      fixture.tenant.id,
      ClinicalObjectiveId.create(created.id),
    );

    assert.ok(reloaded);
    assert.equal(reloaded.getVersion(), activated.version);
    assert.equal(reloaded.getUpdatedAt().toISOString(), LATER.toISOString());
  });

  it('allows objectives without origin references', async () => {
    const fixture = await createFixture();
    const created = await createHandler().execute(
      new CreateClinicalObjectiveCommand({
        tenantId: fixture.tenant.id,
        patientId: fixture.patient.id,
        createdByNutritionistId: fixture.nutritionist.id,
        responsibleNutritionistId: fixture.nutritionist.id,
        type: 'OTHER',
        title: 'Standalone objective',
      }),
    );

    assert.equal(created.originClinicalEncounterId, null);
    assert.equal(created.originAnamnesisId, null);

    const row = await prisma.clinicalObjective.findUnique({ where: { id: created.id } });
    assert.ok(row);
    assert.equal(row.originClinicalEncounterId, null);
    assert.equal(row.originAnamnesisId, null);
  });
});
