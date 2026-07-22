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
import { ActivateClinicalObjectiveCommand } from '../../application/activate-clinical-objective/activate-clinical-objective.command.js';
import { ActivateClinicalObjectiveHandler } from '../../application/activate-clinical-objective/activate-clinical-objective.handler.js';
import { CreateClinicalObjectiveCommand } from '../../application/create-clinical-objective/create-clinical-objective.command.js';
import { CreateClinicalObjectiveHandler } from '../../application/create-clinical-objective/create-clinical-objective.handler.js';
import { StartClinicalEncounterCommand } from '../../application/start-clinical-encounter/start-clinical-encounter.command.js';
import { StartClinicalEncounterHandler } from '../../application/start-clinical-encounter/start-clinical-encounter.handler.js';
import { OutcomeTracking } from '../../domain/aggregates/outcome-tracking.aggregate.js';
import { DefaultOutcomeRecordingPolicy } from '../../domain/policies/outcome-recording-policy.js';
import { OutcomeAssessment } from '../../domain/value-objects/outcome-assessment.js';
import {
  OutcomeClinicalNotes,
  ProfessionalRationale,
} from '../../domain/value-objects/outcome-assessment-text.js';
import { OutcomeTrackingId } from '../../domain/value-objects/outcome-tracking-id.js';
import { OutcomeTrackingStatusValue } from '../../domain/value-objects/outcome-tracking-status.js';
import { ClinicalEncounterTypeValue } from '../../domain/value-objects/clinical-encounter-type.js';
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
import { PrismaOutcomeTrackingRepository } from './prisma-outcome-tracking.repository.js';

requireDatabaseUrl();

const MOMENT_A = new Date('2026-07-10T10:00:00.000Z');
const MOMENT_B = new Date('2026-07-20T10:00:00.000Z');
const EVALUATED_A = new Date('2026-07-10T09:45:00.000Z');
const EVALUATED_B = new Date('2026-07-20T09:45:00.000Z');
const RECORD_A_LATE = new Date('2026-07-25T18:00:00.000Z');
const RECORD_B_EARLY = new Date('2026-07-20T11:00:00.000Z');

const prisma = new PrismaClient();
const encounterRepository = new PrismaClinicalEncounterRepository(prisma);
const anamnesisRepository = new PrismaAnamnesisRepository(prisma);
const clinicalObjectiveRepository = new PrismaClinicalObjectiveRepository(prisma);
const outcomeTrackingRepository = new PrismaOutcomeTrackingRepository(prisma);
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

const recordingPolicy = new DefaultOutcomeRecordingPolicy();

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

function createCreateObjectiveHandler(clock: FixedClock) {
  return new CreateClinicalObjectiveHandler(
    clinicalObjectiveRepository,
    clinicalTenantDirectory,
    patientClinicalDirectory,
    clinicalNutritionistDirectory,
    clinicalEncounterDirectory,
    anamnesisDirectory,
    clock,
    noopEventDispatcher,
  );
}

function createActivateObjectiveHandler(clock: FixedClock) {
  return new ActivateClinicalObjectiveHandler(
    clinicalObjectiveRepository,
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

async function createActiveObjective(clock: FixedClock) {
  const objective = await createCreateObjectiveHandler(clock).execute(
    new CreateClinicalObjectiveCommand({
      tenantId: seed.tenant.id,
      patientId: seed.patient.id,
      createdByNutritionistId: seed.nutritionist.id,
      responsibleNutritionistId: seed.nutritionist.id,
      type: 'WEIGHT_LOSS',
      title: 'Lose 5kg in 3 months',
      clinicalRationale: 'Reduce visceral adiposity.',
      successCriteria: 'Waist reduction and improved labs.',
    }),
  );

  await createActivateObjectiveHandler(clock).execute(
    new ActivateClinicalObjectiveCommand({
      tenantId: seed.tenant.id,
      clinicalObjectiveId: objective.id,
    }),
  );

  return objective;
}

async function createDraftTracking(options: {
  objectiveId: string;
  encounterId?: string;
  clinicalMomentAt?: Date;
  clock: FixedClock;
  id?: string;
}) {
  const tracking = OutcomeTracking.create({
    id: options.id ? OutcomeTrackingId.create(options.id) : undefined,
    tenantId: seed.tenant.id,
    patientId: seed.patient.id,
    clinicalObjectiveId: options.objectiveId,
    createdByNutritionistId: seed.nutritionist.id,
    responsibleNutritionistId: seed.nutritionist.id,
    originClinicalEncounterId: options.encounterId ?? null,
    clinicalMomentAt: options.clinicalMomentAt ?? null,
    now: options.clock.now(),
  });

  await outcomeTrackingRepository.save(tracking);
  return tracking;
}

async function prepareAndRecordTracking(
  tracking: OutcomeTracking,
  evaluatedAt: Date,
  recordClock: FixedClock,
) {
  tracking.edit(
    {
      outcomeAssessment: OutcomeAssessment.parse('ON_TRACK'),
      professionalRationale: ProfessionalRationale.create('Progress documented.'),
      clinicalNotes: OutcomeClinicalNotes.create('Continue current plan.'),
      evaluatedAt,
    },
    recordClock.now(),
  );
  tracking.record(recordClock.now(), recordingPolicy);
  await outcomeTrackingRepository.save(tracking);
  return tracking;
}

before(async () => {
  await resetClinicalIntegrationDatabase(prisma, { includeAssessments: true });
});

after(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  await resetClinicalIntegrationDatabase(prisma, { includeAssessments: true });
  seed = await seedClinicalIntegrationBase(
    fixtureRepositories,
    { patientNutritionistDirectory },
    noopEventDispatcher,
    { emailPrefix: 'clinical.outcome.integration' },
  );
});

describe('PrismaOutcomeTrackingRepository (integration)', () => {
  it('persists and finds an outcome tracking by tenant and id', async () => {
    const objective = await createActiveObjective(new FixedClock(MOMENT_A));
    const encounter = await startEncounter(new FixedClock(MOMENT_A));
    const tracking = await createDraftTracking({
      objectiveId: objective.id,
      encounterId: encounter.id,
      clinicalMomentAt: MOMENT_A,
      clock: new FixedClock(MOMENT_A),
    });

    const found = await outcomeTrackingRepository.findByTenantAndId(
      seed.tenant.id,
      tracking.getId(),
    );

    assert.ok(found);
    assert.equal(found.getId().toString(), tracking.getId().toString());
    assert.equal(found.getClinicalObjectiveId(), objective.id);
    assert.deepEqual(found.getClinicalMomentAt(), MOMENT_A);
  });

  it('scopes findByTenantAndId to tenant', async () => {
    const objective = await createActiveObjective(new FixedClock(MOMENT_A));
    const tracking = await createDraftTracking({
      objectiveId: objective.id,
      clock: new FixedClock(MOMENT_A),
    });

    const found = await outcomeTrackingRepository.findByTenantAndId(
      '550e8400-e29b-41d4-a716-446655440099',
      tracking.getId(),
    );

    assert.equal(found, null);
  });

  it('findByClinicalObjective returns chronologically sorted trackings', async () => {
    const objective = await createActiveObjective(new FixedClock(MOMENT_A));

    const first = await createDraftTracking({
      objectiveId: objective.id,
      clock: new FixedClock(MOMENT_A),
      id: '550e8400-e29b-41d4-a716-446655440080',
    });
    await prepareAndRecordTracking(first, EVALUATED_A, new FixedClock(RECORD_A_LATE));

    const second = await createDraftTracking({
      objectiveId: objective.id,
      clock: new FixedClock(MOMENT_B),
      id: '550e8400-e29b-41d4-a716-446655440081',
    });
    await prepareAndRecordTracking(second, EVALUATED_B, new FixedClock(RECORD_B_EARLY));

    const trackings = await outcomeTrackingRepository.findByClinicalObjective(
      seed.tenant.id,
      objective.id,
      [OutcomeTrackingStatusValue.Recorded],
    );

    assert.equal(trackings.length, 2);
    assert.equal(trackings[0]?.getId().toString(), second.getId().toString());
    assert.equal(trackings[1]?.getId().toString(), first.getId().toString());
  });

  it('stores lifecycle timestamps after record', async () => {
    const objective = await createActiveObjective(new FixedClock(MOMENT_A));
    const tracking = await createDraftTracking({
      objectiveId: objective.id,
      clock: new FixedClock(MOMENT_A),
    });

    await prepareAndRecordTracking(tracking, EVALUATED_A, new FixedClock(RECORD_A_LATE));

    const found = await outcomeTrackingRepository.findByTenantAndId(
      seed.tenant.id,
      tracking.getId(),
    );

    assert.equal(found?.getStatus(), OutcomeTrackingStatusValue.Recorded);
    assert.deepEqual(found?.getEvaluatedAt(), EVALUATED_A);
    assert.deepEqual(found?.getRecordedAt(), RECORD_A_LATE);
  });

  it('persists optional encounter origin and clinicalMomentAt', async () => {
    const objective = await createActiveObjective(new FixedClock(MOMENT_A));
    const encounter = await startEncounter(new FixedClock(MOMENT_A));
    const tracking = await createDraftTracking({
      objectiveId: objective.id,
      encounterId: encounter.id,
      clinicalMomentAt: MOMENT_A,
      clock: new FixedClock(MOMENT_A),
    });

    const found = await outcomeTrackingRepository.findByTenantAndId(
      seed.tenant.id,
      tracking.getId(),
    );

    assert.equal(found?.getOriginClinicalEncounterId(), encounter.id);
    assert.deepEqual(found?.getClinicalMomentAt(), MOMENT_A);
  });

  it('findLatestRecordedByClinicalObjective uses evaluatedAt ordering', async () => {
    const objective = await createActiveObjective(new FixedClock(MOMENT_A));

    const first = await createDraftTracking({
      objectiveId: objective.id,
      clock: new FixedClock(MOMENT_A),
      id: '550e8400-e29b-41d4-a716-446655440090',
    });
    await prepareAndRecordTracking(first, EVALUATED_A, new FixedClock(RECORD_A_LATE));

    const second = await createDraftTracking({
      objectiveId: objective.id,
      clock: new FixedClock(MOMENT_B),
      id: '550e8400-e29b-41d4-a716-446655440091',
    });
    await prepareAndRecordTracking(second, EVALUATED_B, new FixedClock(RECORD_B_EARLY));

    const latest = await outcomeTrackingRepository.findLatestRecordedByClinicalObjective(
      seed.tenant.id,
      objective.id,
    );

    assert.equal(latest?.getId().toString(), second.getId().toString());
  });

  it('findPreviousRecordedByClinicalObjective resolves prior tracking by evaluatedAt', async () => {
    const objective = await createActiveObjective(new FixedClock(MOMENT_A));

    const first = await createDraftTracking({
      objectiveId: objective.id,
      clock: new FixedClock(MOMENT_A),
      id: '550e8400-e29b-41d4-a716-446655440092',
    });
    await prepareAndRecordTracking(first, EVALUATED_A, new FixedClock(RECORD_A_LATE));

    const second = await createDraftTracking({
      objectiveId: objective.id,
      clock: new FixedClock(MOMENT_B),
      id: '550e8400-e29b-41d4-a716-446655440093',
    });
    await prepareAndRecordTracking(second, EVALUATED_B, new FixedClock(RECORD_B_EARLY));

    const previous = await outcomeTrackingRepository.findPreviousRecordedByClinicalObjective(
      seed.tenant.id,
      objective.id,
      EVALUATED_B,
      second.getId(),
    );

    assert.equal(previous?.getId().toString(), first.getId().toString());
  });

  it('supports cancel from DRAFT', async () => {
    const objective = await createActiveObjective(new FixedClock(MOMENT_A));
    const tracking = await createDraftTracking({
      objectiveId: objective.id,
      clock: new FixedClock(MOMENT_A),
    });

    tracking.cancel(new FixedClock(MOMENT_A).now());
    await outcomeTrackingRepository.save(tracking);

    const found = await outcomeTrackingRepository.findByTenantAndId(
      seed.tenant.id,
      tracking.getId(),
    );

    assert.equal(found?.getStatus(), OutcomeTrackingStatusValue.Cancelled);
    assert.deepEqual(found?.getCancelledAt(), MOMENT_A);
  });
});
