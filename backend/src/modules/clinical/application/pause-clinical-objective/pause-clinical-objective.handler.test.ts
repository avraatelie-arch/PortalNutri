import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { ClinicalObjective } from '../../domain/aggregates/clinical-objective.aggregate.js';
import { ClinicalObjectiveId } from '../../domain/value-objects/clinical-objective-id.js';
import { ClinicalObjectivePriorityValue } from '../../domain/value-objects/clinical-objective-priority.js';
import { ClinicalObjectiveStatusValue } from '../../domain/value-objects/clinical-objective-status.js';
import { ClinicalObjectiveTitle } from '../../domain/value-objects/clinical-objective-title.js';
import { ClinicalObjectiveType } from '../../domain/value-objects/clinical-objective-type.js';
import { ClinicalRationale } from '../../domain/value-objects/clinical-rationale.js';
import { SuccessCriteria } from '../../domain/value-objects/success-criteria.js';
import { InMemoryAnamnesisDirectory } from '../../infrastructure/adapters/in-memory-anamnesis-directory.js';
import { InMemoryClinicalEncounterDirectory } from '../../infrastructure/adapters/in-memory-clinical-encounter-directory.js';
import { InMemoryNutritionistDirectory } from '../../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryPatientClinicalDirectory } from '../../infrastructure/adapters/in-memory-patient-clinical-directory.js';
import { InMemoryTenantDirectory } from '../../infrastructure/adapters/in-memory-tenant-directory.js';
import { InMemoryClinicalObjectiveRepository } from '../../infrastructure/repositories/in-memory-clinical-objective.repository.js';
import { ClinicalObjectiveNotActiveError } from '../errors/clinical-objective-not-active.error.js';
import { PauseClinicalObjectiveCommand } from './pause-clinical-objective.command.js';
import { PauseClinicalObjectiveHandler } from './pause-clinical-objective.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const NEXT_DAY = new Date('2026-07-21T10:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const NEW_RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440032';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';
const OBJECTIVE_ID = '550e8400-e29b-41d4-a716-446655440070';

function seedDraftObjective(repository, overrides) {
  const objective = ClinicalObjective.create({
    id: ClinicalObjectiveId.create(OBJECTIVE_ID),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: ENCOUNTER_ID,
    originAnamnesisId: ANAMNESIS_ID,
    type: ClinicalObjectiveType.parse('WEIGHT_LOSS'),
    title: ClinicalObjectiveTitle.create(overrides?.title ?? 'Lose 5kg'),
    targetDate: NEXT_DAY,
    now: NOW,
    ...overrides,
  });
  objective.clearDomainEvents();
  return repository.save(objective).then(() => objective);
}

function seedActiveObjective(repository) {
  const objective = ClinicalObjective.reconstitute({
    id: ClinicalObjectiveId.create(OBJECTIVE_ID),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: ENCOUNTER_ID,
    originAnamnesisId: ANAMNESIS_ID,
    type: ClinicalObjectiveType.parse('WEIGHT_LOSS'),
    status: ClinicalObjectiveStatusValue.Active,
    priority: ClinicalObjectivePriorityValue.Medium,
    version: 2,
    title: ClinicalObjectiveTitle.create('Active objective'),
    clinicalRationale: ClinicalRationale.empty(),
    successCriteria: SuccessCriteria.empty(),
    targetDate: NEXT_DAY,
    activatedAt: NOW,
    pausedAt: null,
    completedAt: null,
    cancelledAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  });
  return repository.save(objective).then(() => objective);
}

function seedPausedObjective(repository) {
  const objective = ClinicalObjective.reconstitute({
    id: ClinicalObjectiveId.create(OBJECTIVE_ID),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: ENCOUNTER_ID,
    originAnamnesisId: ANAMNESIS_ID,
    type: ClinicalObjectiveType.parse('WEIGHT_LOSS'),
    status: ClinicalObjectiveStatusValue.Paused,
    priority: ClinicalObjectivePriorityValue.Medium,
    version: 3,
    title: ClinicalObjectiveTitle.create('Paused objective'),
    clinicalRationale: ClinicalRationale.empty(),
    successCriteria: SuccessCriteria.empty(),
    targetDate: NEXT_DAY,
    activatedAt: NOW,
    pausedAt: NOW,
    completedAt: null,
    cancelledAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  });
  return repository.save(objective).then(() => objective);
}


describe('PauseClinicalObjectiveHandler', () => {
  it('pauses an active objective', async () => {
    const repository = new InMemoryClinicalObjectiveRepository();
    await seedActiveObjective(repository);
    const handler = new PauseClinicalObjectiveHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new PauseClinicalObjectiveCommand({
        tenantId: TENANT_ID,
        clinicalObjectiveId: OBJECTIVE_ID,
      }),
    );

    assert.equal(result.status, ClinicalObjectiveStatusValue.Paused);
    assert.equal(result.pausedAt, LATER.toISOString());
  });

  it('throws when objective is not active', async () => {
    const repository = new InMemoryClinicalObjectiveRepository();
    await seedDraftObjective(repository);
    const handler = new PauseClinicalObjectiveHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new PauseClinicalObjectiveCommand({
            tenantId: TENANT_ID,
            clinicalObjectiveId: OBJECTIVE_ID,
          }),
        ),
      ClinicalObjectiveNotActiveError,
    );
  });
});
