import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { requireDatabaseUrl } from '../../../../config/test-env.js';
import {
  resetClinicalIntegrationDatabase,
  seedClinicalIntegrationBase,
  type ClinicalIntegrationFixtureSeed,
} from '../../../../test-support/clinical-integration-fixture.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CancelClinicalEvolutionCommand } from '../../application/cancel-clinical-evolution/cancel-clinical-evolution.command.js';
import { CancelClinicalEvolutionHandler } from '../../application/cancel-clinical-evolution/cancel-clinical-evolution.handler.js';
import { EditClinicalEvolutionCommand } from '../../application/edit-clinical-evolution/edit-clinical-evolution.command.js';
import { EditClinicalEvolutionHandler } from '../../application/edit-clinical-evolution/edit-clinical-evolution.handler.js';
import { FinalizeClinicalEvolutionCommand } from '../../application/finalize-clinical-evolution/finalize-clinical-evolution.command.js';
import { FinalizeClinicalEvolutionHandler } from '../../application/finalize-clinical-evolution/finalize-clinical-evolution.handler.js';
import { FindClinicalEvolutionByEncounterQuery } from '../../application/find-clinical-evolution-by-encounter/find-clinical-evolution-by-encounter.query.js';
import { FindClinicalEvolutionByEncounterHandler } from '../../application/find-clinical-evolution-by-encounter/find-clinical-evolution-by-encounter.handler.js';
import { FindClinicalEvolutionQuery } from '../../application/find-clinical-evolution/find-clinical-evolution.query.js';
import { FindClinicalEvolutionHandler } from '../../application/find-clinical-evolution/find-clinical-evolution.handler.js';
import { FindLatestFinalizedClinicalEvolutionByPatientQuery } from '../../application/find-latest-finalized-clinical-evolution-by-patient/find-latest-finalized-clinical-evolution-by-patient.query.js';
import { FindLatestFinalizedClinicalEvolutionByPatientHandler } from '../../application/find-latest-finalized-clinical-evolution-by-patient/find-latest-finalized-clinical-evolution-by-patient.handler.js';
import { FindPreviousFinalizedClinicalEvolutionQuery } from '../../application/find-previous-finalized-clinical-evolution/find-previous-finalized-clinical-evolution.query.js';
import { FindPreviousFinalizedClinicalEvolutionHandler } from '../../application/find-previous-finalized-clinical-evolution/find-previous-finalized-clinical-evolution.handler.js';
import { FinishClinicalEncounterCommand } from '../../application/finish-clinical-encounter/finish-clinical-encounter.command.js';
import { FinishClinicalEncounterHandler } from '../../application/finish-clinical-encounter/finish-clinical-encounter.handler.js';
import { StartClinicalEncounterCommand } from '../../application/start-clinical-encounter/start-clinical-encounter.command.js';
import { StartClinicalEncounterHandler } from '../../application/start-clinical-encounter/start-clinical-encounter.handler.js';
import { StartClinicalEvolutionCommand } from '../../application/start-clinical-evolution/start-clinical-evolution.command.js';
import { StartClinicalEvolutionHandler } from '../../application/start-clinical-evolution/start-clinical-evolution.handler.js';
import { ClinicalEvolutionId } from '../../domain/value-objects/clinical-evolution-id.js';
import { DefaultEvolutionFinalizationPolicy } from '../../domain/policies/evolution-finalization-policy.js';
import { ClinicalEvolutionStatusValue } from '../../domain/value-objects/clinical-evolution-status.js';
import { ClinicalEncounterTypeValue } from '../../domain/value-objects/clinical-encounter-type.js';
import { PrismaMembershipRepository } from '../../../iam/infrastructure/repositories/prisma-membership.repository.js';
import { PrismaPersonRepository } from '../../../iam/infrastructure/repositories/prisma-person.repository.js';
import { PrismaTenantRepository } from '../../../iam/infrastructure/repositories/prisma-tenant.repository.js';
import { PrismaNutritionistRepository } from '../../../nutrition/infrastructure/repositories/prisma-nutritionist.repository.js';
import { PrismaNutritionistDirectoryAdapter } from '../../../patient/infrastructure/adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaPatientRepository } from '../../../patient/infrastructure/repositories/prisma-patient.repository.js';
import { PrismaPatientNutritionistAssignmentRepository } from '../../../patient/infrastructure/repositories/prisma-patient-nutritionist-assignment.repository.js';
import { PrismaAppointmentDirectoryAdapter } from '../adapters/prisma-appointment-directory.adapter.js';
import { PrismaClinicalEncounterDirectoryAdapter } from '../adapters/prisma-clinical-encounter-directory.adapter.js';
import { PrismaNutritionistDirectoryAdapter as ClinicalNutritionistDirectoryAdapter } from '../adapters/prisma-nutritionist-directory.adapter.js';
import { PrismaPatientDirectoryAdapter } from '../adapters/prisma-patient-directory.adapter.js';
import { PrismaTenantDirectoryAdapter } from '../adapters/prisma-tenant-directory.adapter.js';
import { PrismaClinicalEncounterRepository } from './prisma-clinical-encounter.repository.js';
import { PrismaAnamnesisRepository } from './prisma-anamnesis.repository.js';
import { PrismaClinicalEvolutionRepository } from './prisma-clinical-evolution.repository.js';

requireDatabaseUrl();

const MOMENT_A = new Date('2026-07-10T10:00:00.000Z');
const MOMENT_B = new Date('2026-07-20T10:00:00.000Z');
const FINALIZE_A_LATE = new Date('2026-07-25T18:00:00.000Z');
const FINALIZE_B_EARLY = new Date('2026-07-20T11:00:00.000Z');

const prisma = new PrismaClient();
const encounterRepository = new PrismaClinicalEncounterRepository(prisma);
const anamnesisRepository = new PrismaAnamnesisRepository(prisma);
const clinicalEvolutionRepository = new PrismaClinicalEvolutionRepository(prisma);
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

const finalizationPolicy = new DefaultEvolutionFinalizationPolicy();

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

let seed: ClinicalIntegrationFixtureSeed;

function createStartEncounterHandler(clock: FixedClock) {
  return new StartClinicalEncounterHandler(
    encounterRepository,
    clinicalTenantDirectory,
    clinicalPatientDirectory,
    clinicalNutritionistDirectory,
    clinicalAppointmentDirectory,
    clock,
    noopEventDispatcher,
  );
}

function createStartEvolutionHandler(clock: FixedClock) {
  return new StartClinicalEvolutionHandler(
    clinicalEvolutionRepository,
    encounterRepository,
    clinicalTenantDirectory,
    clock,
    noopEventDispatcher,
  );
}

function createEditEvolutionHandler(clock: FixedClock) {
  return new EditClinicalEvolutionHandler(
    clinicalEvolutionRepository,
    clock,
    noopEventDispatcher,
  );
}

function createFinalizeEvolutionHandler(clock: FixedClock) {
  return new FinalizeClinicalEvolutionHandler(
    clinicalEvolutionRepository,
    clinicalEncounterDirectory,
    finalizationPolicy,
    clock,
    noopEventDispatcher,
  );
}

async function startEncounter(clock: FixedClock) {
  return createStartEncounterHandler(clock).execute(
    new StartClinicalEncounterCommand({
      tenantId: seed.tenant.id,
      patientId: seed.patient.id,
      nutritionistId: seed.nutritionist.id,
      type: ClinicalEncounterTypeValue.FollowUp,
    }),
  );
}

async function startAndPrepareEvolution(
  encounterId: string,
  startClock: FixedClock,
  editClock: FixedClock,
) {
  const evolution = await createStartEvolutionHandler(startClock).execute(
    new StartClinicalEvolutionCommand({
      tenantId: seed.tenant.id,
      clinicalEncounterId: encounterId,
      patientId: seed.patient.id,
      createdByNutritionistId: seed.nutritionist.id,
      responsibleNutritionistId: seed.nutritionist.id,
    }),
  );

  await createEditEvolutionHandler(editClock).execute(
    new EditClinicalEvolutionCommand({
      tenantId: seed.tenant.id,
      clinicalEvolutionId: evolution.id,
      subjectiveEvolution: 'Patient reports improved adherence.',
      nextClinicalConsiderations: 'Maintain current therapeutic plan.',
    }),
  );

  return evolution;
}

before(async () => {
  await resetClinicalIntegrationDatabase(prisma);
});

after(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetClinicalIntegrationDatabase(prisma);
  seed = await seedClinicalIntegrationBase(
    fixtureRepositories,
    { patientNutritionistDirectory },
    noopEventDispatcher,
    { emailPrefix: 'clinical.evolution.integration' },
  );
});

describe('PrismaClinicalEvolutionRepository (integration)', () => {
  it('persists and finds a clinical evolution by tenant and id', async () => {
    const encounter = await startEncounter(new FixedClock(MOMENT_A));
    const evolution = await startAndPrepareEvolution(
      encounter.id,
      new FixedClock(MOMENT_A),
      new FixedClock(MOMENT_A),
    );

    const found = await new FindClinicalEvolutionHandler(clinicalEvolutionRepository).execute(
      new FindClinicalEvolutionQuery({
        tenantId: seed.tenant.id,
        clinicalEvolutionId: evolution.id,
      }),
    );

    assert.equal(found.id, evolution.id);
    assert.equal(found.clinicalEncounterId, encounter.id);
    assert.equal(found.clinicalMomentAt, MOMENT_A.toISOString());
  });

  it('scopes findByTenantAndId to tenant', async () => {
    const encounter = await startEncounter(new FixedClock(MOMENT_A));
    const evolution = await startAndPrepareEvolution(
      encounter.id,
      new FixedClock(MOMENT_A),
      new FixedClock(MOMENT_A),
    );

    const found = await clinicalEvolutionRepository.findByTenantAndId(
      '550e8400-e29b-41d4-a716-446655440099',
      ClinicalEvolutionId.create(evolution.id),
    );

    assert.equal(found, null);
  });

  it('finds evolution by encounter with 1:1 relationship', async () => {
    const encounter = await startEncounter(new FixedClock(MOMENT_A));
    const evolution = await startAndPrepareEvolution(
      encounter.id,
      new FixedClock(MOMENT_A),
      new FixedClock(MOMENT_A),
    );

    const found = await new FindClinicalEvolutionByEncounterHandler(
      clinicalEvolutionRepository,
    ).execute(
      new FindClinicalEvolutionByEncounterQuery({
        tenantId: seed.tenant.id,
        clinicalEncounterId: encounter.id,
      }),
    );

    assert.ok(found);
    assert.equal(found?.id, evolution.id);
  });

  it('stores lifecycle timestamps after finalize', async () => {
    const encounter = await startEncounter(new FixedClock(MOMENT_A));
    const evolution = await startAndPrepareEvolution(
      encounter.id,
      new FixedClock(MOMENT_A),
      new FixedClock(MOMENT_A),
    );

    const finalized = await createFinalizeEvolutionHandler(new FixedClock(FINALIZE_A_LATE)).execute(
      new FinalizeClinicalEvolutionCommand({
        tenantId: seed.tenant.id,
        clinicalEvolutionId: evolution.id,
      }),
    );

    assert.equal(finalized.status, ClinicalEvolutionStatusValue.Finalized);
    assert.equal(finalized.finalizedAt, FINALIZE_A_LATE.toISOString());
  });

  it('allows finalize after encounter is finished', async () => {
    const encounter = await startEncounter(new FixedClock(MOMENT_A));
    const evolution = await startAndPrepareEvolution(
      encounter.id,
      new FixedClock(MOMENT_A),
      new FixedClock(MOMENT_A),
    );

    await new FinishClinicalEncounterHandler(
      encounterRepository,
      new FixedClock(MOMENT_A),
      noopEventDispatcher,
    ).execute(
      new FinishClinicalEncounterCommand({
        tenantId: seed.tenant.id,
        encounterId: encounter.id,
      }),
    );

    const finalized = await createFinalizeEvolutionHandler(new FixedClock(FINALIZE_A_LATE)).execute(
      new FinalizeClinicalEvolutionCommand({
        tenantId: seed.tenant.id,
        clinicalEvolutionId: evolution.id,
      }),
    );

    assert.equal(finalized.status, ClinicalEvolutionStatusValue.Finalized);
  });

  it('findLatestFinalizedByPatient uses clinicalMomentAt ordering', async () => {
    const encounterA = await startEncounter(new FixedClock(MOMENT_A));
    const evolutionA = await startAndPrepareEvolution(
      encounterA.id,
      new FixedClock(MOMENT_A),
      new FixedClock(MOMENT_A),
    );
    await createFinalizeEvolutionHandler(new FixedClock(FINALIZE_A_LATE)).execute(
      new FinalizeClinicalEvolutionCommand({
        tenantId: seed.tenant.id,
        clinicalEvolutionId: evolutionA.id,
      }),
    );

    await new FinishClinicalEncounterHandler(
      encounterRepository,
      new FixedClock(MOMENT_A),
      noopEventDispatcher,
    ).execute(
      new FinishClinicalEncounterCommand({
        tenantId: seed.tenant.id,
        encounterId: encounterA.id,
      }),
    );

    const encounterB = await startEncounter(new FixedClock(MOMENT_B));
    const evolutionB = await startAndPrepareEvolution(
      encounterB.id,
      new FixedClock(MOMENT_B),
      new FixedClock(MOMENT_B),
    );
    await createFinalizeEvolutionHandler(new FixedClock(FINALIZE_B_EARLY)).execute(
      new FinalizeClinicalEvolutionCommand({
        tenantId: seed.tenant.id,
        clinicalEvolutionId: evolutionB.id,
      }),
    );

    const latest = await new FindLatestFinalizedClinicalEvolutionByPatientHandler(
      clinicalEvolutionRepository,
    ).execute(
      new FindLatestFinalizedClinicalEvolutionByPatientQuery({
        tenantId: seed.tenant.id,
        patientId: seed.patient.id,
      }),
    );

    assert.equal(latest?.id, evolutionB.id);
  });

  it('findPreviousFinalized resolves prior evolution by clinicalMomentAt despite late finalization', async () => {
    const encounterA = await startEncounter(new FixedClock(MOMENT_A));
    const evolutionA = await startAndPrepareEvolution(
      encounterA.id,
      new FixedClock(MOMENT_A),
      new FixedClock(MOMENT_A),
    );
    await createFinalizeEvolutionHandler(new FixedClock(FINALIZE_A_LATE)).execute(
      new FinalizeClinicalEvolutionCommand({
        tenantId: seed.tenant.id,
        clinicalEvolutionId: evolutionA.id,
      }),
    );

    await new FinishClinicalEncounterHandler(
      encounterRepository,
      new FixedClock(MOMENT_A),
      noopEventDispatcher,
    ).execute(
      new FinishClinicalEncounterCommand({
        tenantId: seed.tenant.id,
        encounterId: encounterA.id,
      }),
    );

    const encounterB = await startEncounter(new FixedClock(MOMENT_B));
    const evolutionB = await startAndPrepareEvolution(
      encounterB.id,
      new FixedClock(MOMENT_B),
      new FixedClock(MOMENT_B),
    );
    await createFinalizeEvolutionHandler(new FixedClock(FINALIZE_B_EARLY)).execute(
      new FinalizeClinicalEvolutionCommand({
        tenantId: seed.tenant.id,
        clinicalEvolutionId: evolutionB.id,
      }),
    );

    const previous = await new FindPreviousFinalizedClinicalEvolutionHandler(
      clinicalEvolutionRepository,
    ).execute(
      new FindPreviousFinalizedClinicalEvolutionQuery({
        tenantId: seed.tenant.id,
        clinicalEvolutionId: evolutionB.id,
      }),
    );

    assert.equal(previous?.id, evolutionA.id);
  });

  it('supports cancel from DRAFT', async () => {
    const encounter = await startEncounter(new FixedClock(MOMENT_A));
    const evolution = await startAndPrepareEvolution(
      encounter.id,
      new FixedClock(MOMENT_A),
      new FixedClock(MOMENT_A),
    );

    const cancelled = await new CancelClinicalEvolutionHandler(
      clinicalEvolutionRepository,
      new FixedClock(MOMENT_A),
      noopEventDispatcher,
    ).execute(
      new CancelClinicalEvolutionCommand({
        tenantId: seed.tenant.id,
        clinicalEvolutionId: evolution.id,
      }),
    );

    assert.equal(cancelled.status, ClinicalEvolutionStatusValue.Cancelled);
  });
});
