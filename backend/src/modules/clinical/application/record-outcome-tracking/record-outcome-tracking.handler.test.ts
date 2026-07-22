import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { ClinicalObjective } from '../../domain/aggregates/clinical-objective.aggregate.js';
import { OutcomeTracking } from '../../domain/aggregates/outcome-tracking.aggregate.js';
import type { ClinicalObjectiveRepository } from '../../domain/repositories/clinical-objective-repository.js';
import { DefaultOutcomeRecordingPolicy } from '../../domain/policies/outcome-recording-policy.js';
import { ClinicalObjectiveId } from '../../domain/value-objects/clinical-objective-id.js';
import { ClinicalObjectivePriorityValue } from '../../domain/value-objects/clinical-objective-priority.js';
import { ClinicalObjectiveStatusValue } from '../../domain/value-objects/clinical-objective-status.js';
import { ClinicalObjectiveTitle } from '../../domain/value-objects/clinical-objective-title.js';
import { ClinicalObjectiveType } from '../../domain/value-objects/clinical-objective-type.js';
import { ClinicalRationale } from '../../domain/value-objects/clinical-rationale.js';
import { OutcomeAssessment } from '../../domain/value-objects/outcome-assessment.js';
import { OutcomeTrackingId } from '../../domain/value-objects/outcome-tracking-id.js';
import { OutcomeTrackingStatusValue } from '../../domain/value-objects/outcome-tracking-status.js';
import { SuccessCriteria } from '../../domain/value-objects/success-criteria.js';
import { InMemoryClinicalEncounterDirectory } from '../../infrastructure/adapters/in-memory-clinical-encounter-directory.js';
import { InMemoryClinicalObjectiveRepository } from '../../infrastructure/repositories/in-memory-clinical-objective.repository.js';
import { InMemoryOutcomeTrackingRepository } from '../../infrastructure/repositories/in-memory-outcome-tracking.repository.js';
import { ClinicalEncounterCancelledForOutcomeTrackingError } from '../errors/clinical-encounter-cancelled-for-outcome-tracking.error.js';
import { RecordOutcomeTrackingCommand } from './record-outcome-tracking.command.js';
import { RecordOutcomeTrackingHandler } from './record-outcome-tracking.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const OBJECTIVE_ID = '550e8400-e29b-41d4-a716-446655440060';
const TRACKING_ID = '550e8400-e29b-41d4-a716-446655440070';

const policy = new DefaultOutcomeRecordingPolicy();

class TrackingClinicalObjectiveRepository implements ClinicalObjectiveRepository {
  private readonly delegate = new InMemoryClinicalObjectiveRepository();
  saveCallsAfterSeed = 0;

  async save(objective: ClinicalObjective): Promise<void> {
    this.saveCallsAfterSeed += 1;
    return this.delegate.save(objective);
  }

  findByTenantAndId(
    tenantId: string,
    id: ClinicalObjectiveId,
  ): Promise<ClinicalObjective | null> {
    return this.delegate.findByTenantAndId(tenantId, id);
  }

  findByPatient(
    tenantId: string,
    patientId: string,
    statuses?: Parameters<ClinicalObjectiveRepository['findByPatient']>[2],
  ) {
    return this.delegate.findByPatient(tenantId, patientId, statuses);
  }

  findActiveByPatient(tenantId: string, patientId: string) {
    return this.delegate.findActiveByPatient(tenantId, patientId);
  }

  findByResponsibleNutritionist(tenantId: string, nutritionistId: string) {
    return this.delegate.findByResponsibleNutritionist(tenantId, nutritionistId);
  }

  findByOriginClinicalEncounter(tenantId: string, clinicalEncounterId: string) {
    return this.delegate.findByOriginClinicalEncounter(tenantId, clinicalEncounterId);
  }

  findByStatus(
    tenantId: string,
    status: Parameters<ClinicalObjectiveRepository['findByStatus']>[1],
  ) {
    return this.delegate.findByStatus(tenantId, status);
  }
}

async function seedActiveObjective(repository: TrackingClinicalObjectiveRepository) {
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
  repository.saveCallsAfterSeed = 0;
  return objective;
}

async function seedDraftTracking(
  repository: InMemoryOutcomeTrackingRepository,
  options?: { originClinicalEncounterId?: string | null },
) {
  const tracking = OutcomeTracking.create({
    id: OutcomeTrackingId.create(TRACKING_ID),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    clinicalObjectiveId: OBJECTIVE_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: options?.originClinicalEncounterId ?? null,
    now: NOW,
  });
  tracking.edit({ outcomeAssessment: OutcomeAssessment.parse('GOAL_ACHIEVED') }, NOW);
  tracking.clearDomainEvents();
  await repository.save(tracking);
  return tracking;
}

function seedEncounterDirectory(status: 'OPEN' | 'FINISHED' | 'CANCELLED') {
  const directory = new InMemoryClinicalEncounterDirectory();
  directory.seed({
    id: ENCOUNTER_ID,
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    nutritionistId: RESPONSIBLE_ID,
    status,
  });
  return directory;
}

describe('RecordOutcomeTrackingHandler', () => {
  it('record with GOAL_ACHIEVED leaves ClinicalObjective in ACTIVE and does not call complete', async () => {
    const outcomeTrackingRepository = new InMemoryOutcomeTrackingRepository();
    const clinicalObjectiveRepository = new TrackingClinicalObjectiveRepository();

    await seedActiveObjective(clinicalObjectiveRepository);
    await seedDraftTracking(outcomeTrackingRepository);

    const handler = new RecordOutcomeTrackingHandler(
      outcomeTrackingRepository,
      seedEncounterDirectory('OPEN'),
      policy,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new RecordOutcomeTrackingCommand({
        tenantId: TENANT_ID,
        outcomeTrackingId: TRACKING_ID,
      }),
    );

    assert.equal(result.status, OutcomeTrackingStatusValue.Recorded);
    assert.equal(result.outcomeAssessment, 'GOAL_ACHIEVED');

    const objective = await clinicalObjectiveRepository.findByTenantAndId(
      TENANT_ID,
      ClinicalObjectiveId.create(OBJECTIVE_ID),
    );

    assert.ok(objective);
    assert.equal(objective.getStatus(), ClinicalObjectiveStatusValue.Active);
    assert.equal(clinicalObjectiveRepository.saveCallsAfterSeed, 0);
  });

  it('rejects record when origin encounter is cancelled', async () => {
    const outcomeTrackingRepository = new InMemoryOutcomeTrackingRepository();
    await seedDraftTracking(outcomeTrackingRepository, {
      originClinicalEncounterId: ENCOUNTER_ID,
    });

    const handler = new RecordOutcomeTrackingHandler(
      outcomeTrackingRepository,
      seedEncounterDirectory('CANCELLED'),
      policy,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new RecordOutcomeTrackingCommand({
            tenantId: TENANT_ID,
            outcomeTrackingId: TRACKING_ID,
          }),
        ),
      ClinicalEncounterCancelledForOutcomeTrackingError,
    );
  });
});
