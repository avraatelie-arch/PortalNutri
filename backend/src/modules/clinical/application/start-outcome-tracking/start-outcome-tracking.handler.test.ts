import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { ClinicalEncounter } from '../../domain/aggregates/clinical-encounter.aggregate.js';
import { ClinicalObjective } from '../../domain/aggregates/clinical-objective.aggregate.js';
import { ClinicalEncounterId } from '../../domain/value-objects/clinical-encounter-id.js';
import { ClinicalEncounterStatus } from '../../domain/value-objects/clinical-encounter-status.js';
import {
  ClinicalEncounterType,
  ClinicalEncounterTypeValue,
} from '../../domain/value-objects/clinical-encounter-type.js';
import { ClinicalObjectiveId } from '../../domain/value-objects/clinical-objective-id.js';
import { ClinicalObjectivePriorityValue } from '../../domain/value-objects/clinical-objective-priority.js';
import { ClinicalObjectiveStatusValue } from '../../domain/value-objects/clinical-objective-status.js';
import { ClinicalObjectiveTitle } from '../../domain/value-objects/clinical-objective-title.js';
import { ClinicalObjectiveType } from '../../domain/value-objects/clinical-objective-type.js';
import { ClinicalNotes } from '../../domain/value-objects/clinical-notes.js';
import { ClinicalRationale } from '../../domain/value-objects/clinical-rationale.js';
import { OutcomeTrackingStatusValue } from '../../domain/value-objects/outcome-tracking-status.js';
import { SuccessCriteria } from '../../domain/value-objects/success-criteria.js';
import { InMemoryAnamnesisDirectory } from '../../infrastructure/adapters/in-memory-anamnesis-directory.js';
import { InMemoryNutritionistDirectory } from '../../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryPatientClinicalDirectory } from '../../infrastructure/adapters/in-memory-patient-clinical-directory.js';
import { InMemoryTenantDirectory } from '../../infrastructure/adapters/in-memory-tenant-directory.js';
import { InMemoryClinicalEncounterRepository } from '../../infrastructure/repositories/in-memory-clinical-encounter.repository.js';
import { InMemoryClinicalObjectiveRepository } from '../../infrastructure/repositories/in-memory-clinical-objective.repository.js';
import { InMemoryOutcomeTrackingRepository } from '../../infrastructure/repositories/in-memory-outcome-tracking.repository.js';
import { ClinicalObjectiveNotAssessableForOutcomeTrackingError } from '../errors/clinical-objective-not-assessable-for-outcome-tracking.error.js';
import { StartOutcomeTrackingCommand } from './start-outcome-tracking.command.js';
import { StartOutcomeTrackingHandler } from './start-outcome-tracking.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const STARTED_AT = new Date('2026-07-20T09:30:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const OBJECTIVE_ID = '550e8400-e29b-41d4-a716-446655440070';

function seedTenant() {
  const tenantDirectory = new InMemoryTenantDirectory();
  tenantDirectory.seed({ id: TENANT_ID, status: 'ACTIVE' });
  return tenantDirectory;
}

function seedPatientDirectory() {
  const directory = new InMemoryPatientClinicalDirectory();
  directory.seed({ id: PATIENT_ID, tenantId: TENANT_ID, status: 'ACTIVE' });
  return directory;
}

function seedNutritionistDirectory() {
  const directory = new InMemoryNutritionistDirectory();
  directory.seed({
    id: CREATED_BY_ID,
    tenantId: TENANT_ID,
    status: 'ACTIVE',
  });
  directory.seed({
    id: RESPONSIBLE_ID,
    tenantId: TENANT_ID,
    status: 'ACTIVE',
  });
  return directory;
}

async function seedFinishedEncounter(repository: InMemoryClinicalEncounterRepository) {
  const encounter = ClinicalEncounter.reconstitute({
    id: ClinicalEncounterId.create(ENCOUNTER_ID),
    tenantId: TENANT_ID,
    appointmentId: null,
    patientId: PATIENT_ID,
    nutritionistId: RESPONSIBLE_ID,
    type: ClinicalEncounterType.create(ClinicalEncounterTypeValue.FollowUp),
    status: ClinicalEncounterStatus.Finished,
    notes: ClinicalNotes.create(null),
    startedAt: STARTED_AT,
    finishedAt: NOW,
    createdAt: NOW,
    updatedAt: NOW,
  });
  await repository.save(encounter);
  return encounter;
}

async function seedActiveObjective(repository: InMemoryClinicalObjectiveRepository) {
  const objective = ClinicalObjective.reconstitute({
    id: ClinicalObjectiveId.create(OBJECTIVE_ID),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: ENCOUNTER_ID,
    originAnamnesisId: null,
    type: ClinicalObjectiveType.parse('WEIGHT_LOSS'),
    status: ClinicalObjectiveStatusValue.Active,
    priority: ClinicalObjectivePriorityValue.Medium,
    version: 2,
    title: ClinicalObjectiveTitle.create('Active objective'),
    clinicalRationale: ClinicalRationale.empty(),
    successCriteria: SuccessCriteria.empty(),
    targetDate: null,
    activatedAt: NOW,
    pausedAt: null,
    completedAt: null,
    cancelledAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  });
  await repository.save(objective);
  return objective;
}

async function seedCompletedObjective(repository: InMemoryClinicalObjectiveRepository) {
  const objective = ClinicalObjective.reconstitute({
    id: ClinicalObjectiveId.create(OBJECTIVE_ID),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: null,
    originAnamnesisId: null,
    type: ClinicalObjectiveType.parse('WEIGHT_LOSS'),
    status: ClinicalObjectiveStatusValue.Completed,
    priority: ClinicalObjectivePriorityValue.Medium,
    version: 4,
    title: ClinicalObjectiveTitle.create('Completed objective'),
    clinicalRationale: ClinicalRationale.empty(),
    successCriteria: SuccessCriteria.empty(),
    targetDate: null,
    activatedAt: NOW,
    pausedAt: null,
    completedAt: NOW,
    cancelledAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  });
  await repository.save(objective);
  return objective;
}

function createHandler(deps: {
  outcomeTrackingRepository?: InMemoryOutcomeTrackingRepository;
  clinicalObjectiveRepository: InMemoryClinicalObjectiveRepository;
  clinicalEncounterRepository: InMemoryClinicalEncounterRepository;
  tenantDirectory?: InMemoryTenantDirectory;
  patientClinicalDirectory?: InMemoryPatientClinicalDirectory;
  nutritionistDirectory?: InMemoryNutritionistDirectory;
  eventDispatcher?: CapturingEventDispatcher;
}) {
  return new StartOutcomeTrackingHandler(
    deps.outcomeTrackingRepository ?? new InMemoryOutcomeTrackingRepository(),
    deps.clinicalObjectiveRepository,
    deps.clinicalEncounterRepository,
    deps.tenantDirectory ?? seedTenant(),
    deps.patientClinicalDirectory ?? seedPatientDirectory(),
    deps.nutritionistDirectory ?? seedNutritionistDirectory(),
    new InMemoryAnamnesisDirectory(),
    new FixedClock(NOW),
    deps.eventDispatcher ?? noopEventDispatcher,
  );
}

describe('StartOutcomeTrackingHandler', () => {
  it('starts outcome tracking for an active clinical objective', async () => {
    const outcomeTrackingRepository = new InMemoryOutcomeTrackingRepository();
    const clinicalObjectiveRepository = new InMemoryClinicalObjectiveRepository();
    const clinicalEncounterRepository = new InMemoryClinicalEncounterRepository();

    await seedActiveObjective(clinicalObjectiveRepository);
    await seedFinishedEncounter(clinicalEncounterRepository);

    const handler = createHandler({
      outcomeTrackingRepository,
      clinicalObjectiveRepository,
      clinicalEncounterRepository,
    });

    const result = await handler.execute(
      new StartOutcomeTrackingCommand({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
        clinicalObjectiveId: OBJECTIVE_ID,
        createdByNutritionistId: CREATED_BY_ID,
        responsibleNutritionistId: RESPONSIBLE_ID,
        originClinicalEncounterId: ENCOUNTER_ID,
      }),
    );

    assert.equal(result.status, OutcomeTrackingStatusValue.Draft);
    assert.equal(result.clinicalObjectiveId, OBJECTIVE_ID);
    assert.equal(result.clinicalMomentAt, STARTED_AT.toISOString());
    assert.equal(result.originClinicalEncounterId, ENCOUNTER_ID);
  });

  it('rejects start when clinical objective is completed', async () => {
    const clinicalObjectiveRepository = new InMemoryClinicalObjectiveRepository();
    const clinicalEncounterRepository = new InMemoryClinicalEncounterRepository();

    await seedCompletedObjective(clinicalObjectiveRepository);

    const handler = createHandler({
      clinicalObjectiveRepository,
      clinicalEncounterRepository,
    });

    await assert.rejects(
      () =>
        handler.execute(
          new StartOutcomeTrackingCommand({
            tenantId: TENANT_ID,
            patientId: PATIENT_ID,
            clinicalObjectiveId: OBJECTIVE_ID,
            createdByNutritionistId: CREATED_BY_ID,
            responsibleNutritionistId: RESPONSIBLE_ID,
          }),
        ),
      ClinicalObjectiveNotAssessableForOutcomeTrackingError,
    );
  });
});
