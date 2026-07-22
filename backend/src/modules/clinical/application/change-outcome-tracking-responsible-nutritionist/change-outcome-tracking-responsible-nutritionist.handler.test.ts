import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { OutcomeTracking } from '../../domain/aggregates/outcome-tracking.aggregate.js';
import { OutcomeTrackingId } from '../../domain/value-objects/outcome-tracking-id.js';
import { InMemoryNutritionistDirectory } from '../../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryOutcomeTrackingRepository } from '../../infrastructure/repositories/in-memory-outcome-tracking.repository.js';
import { ChangeOutcomeTrackingResponsibleNutritionistCommand } from './change-outcome-tracking-responsible-nutritionist.command.js';
import { ChangeOutcomeTrackingResponsibleNutritionistHandler } from './change-outcome-tracking-responsible-nutritionist.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const NEW_RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440032';
const OBJECTIVE_ID = '550e8400-e29b-41d4-a716-446655440060';
const TRACKING_ID = '550e8400-e29b-41d4-a716-446655440070';

function seedNutritionistDirectory() {
  const directory = new InMemoryNutritionistDirectory();
  directory.seed({
    id: NEW_RESPONSIBLE_ID,
    tenantId: TENANT_ID,
    status: 'ACTIVE',
  });
  return directory;
}

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

describe('ChangeOutcomeTrackingResponsibleNutritionistHandler', () => {
  it('changes responsible nutritionist on draft outcome tracking', async () => {
    const repository = new InMemoryOutcomeTrackingRepository();
    await seedDraftTracking(repository);

    const handler = new ChangeOutcomeTrackingResponsibleNutritionistHandler(
      repository,
      seedNutritionistDirectory(),
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new ChangeOutcomeTrackingResponsibleNutritionistCommand({
        tenantId: TENANT_ID,
        outcomeTrackingId: TRACKING_ID,
        responsibleNutritionistId: NEW_RESPONSIBLE_ID,
      }),
    );

    assert.equal(result.responsibleNutritionistId, NEW_RESPONSIBLE_ID);
  });
});
