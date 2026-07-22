import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { OutcomeTracking } from '../../domain/aggregates/outcome-tracking.aggregate.js';
import { DefaultOutcomeRecordingPolicy } from '../../domain/policies/outcome-recording-policy.js';
import { OutcomeAssessment } from '../../domain/value-objects/outcome-assessment.js';
import { OutcomeTrackingId } from '../../domain/value-objects/outcome-tracking-id.js';
import { OutcomeTrackingStatusValue } from '../../domain/value-objects/outcome-tracking-status.js';
import { InMemoryOutcomeTrackingRepository } from '../../infrastructure/repositories/in-memory-outcome-tracking.repository.js';
import { OutcomeTrackingNotDraftError } from '../errors/outcome-tracking-not-draft.error.js';
import { EditOutcomeTrackingCommand } from './edit-outcome-tracking.command.js';
import { EditOutcomeTrackingHandler } from './edit-outcome-tracking.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const OBJECTIVE_ID = '550e8400-e29b-41d4-a716-446655440060';
const TRACKING_ID = '550e8400-e29b-41d4-a716-446655440070';

const policy = new DefaultOutcomeRecordingPolicy();

async function seedDraftTracking(repository: InMemoryOutcomeTrackingRepository) {
  const tracking = OutcomeTracking.create({
    id: OutcomeTrackingId.create(TRACKING_ID),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    clinicalObjectiveId: OBJECTIVE_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    now: NOW,
  });
  tracking.clearDomainEvents();
  await repository.save(tracking);
  return tracking;
}

describe('EditOutcomeTrackingHandler', () => {
  it('edits draft outcome tracking fields', async () => {
    const repository = new InMemoryOutcomeTrackingRepository();
    await seedDraftTracking(repository);

    const handler = new EditOutcomeTrackingHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new EditOutcomeTrackingCommand({
        tenantId: TENANT_ID,
        outcomeTrackingId: TRACKING_ID,
        outcomeAssessment: 'ON_TRACK',
        evaluatedAt: LATER.toISOString(),
      }),
    );

    assert.equal(result.outcomeAssessment, 'ON_TRACK');
    assert.equal(result.evaluatedAt, LATER.toISOString());
  });

  it('rejects edit when outcome tracking is recorded', async () => {
    const repository = new InMemoryOutcomeTrackingRepository();
    const tracking = await seedDraftTracking(repository);
    tracking.edit({ outcomeAssessment: OutcomeAssessment.parse('ON_TRACK') }, NOW);
    tracking.record(NOW, policy);
    tracking.clearDomainEvents();
    await repository.save(tracking);

    const handler = new EditOutcomeTrackingHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new EditOutcomeTrackingCommand({
            tenantId: TENANT_ID,
            outcomeTrackingId: TRACKING_ID,
            clinicalNotes: 'Should fail',
          }),
        ),
      OutcomeTrackingNotDraftError,
    );
  });
});
