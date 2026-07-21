import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { CapturingEventDispatcher } from '../../../../test-support/capturing-event-dispatcher.js';
import { ClinicalObjective } from '../../domain/aggregates/clinical-objective.aggregate.js';
import { ClinicalObjectiveId } from '../../domain/value-objects/clinical-objective-id.js';
import { ClinicalObjectivePriorityValue } from '../../domain/value-objects/clinical-objective-priority.js';
import { ClinicalObjectiveStatusValue } from '../../domain/value-objects/clinical-objective-status.js';
import { ClinicalObjectiveTitle } from '../../domain/value-objects/clinical-objective-title.js';
import { ClinicalObjectiveType } from '../../domain/value-objects/clinical-objective-type.js';
import { ClinicalRationale } from '../../domain/value-objects/clinical-rationale.js';
import { SuccessCriteria } from '../../domain/value-objects/success-criteria.js';
import { InMemoryClinicalObjectiveRepository } from '../../infrastructure/repositories/in-memory-clinical-objective.repository.js';
import { EditClinicalObjectiveCommand } from './edit-clinical-objective.command.js';
import { EditClinicalObjectiveHandler } from './edit-clinical-objective.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const NEXT_DAY = new Date('2026-07-21T10:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const OBJECTIVE_ID = '550e8400-e29b-41d4-a716-446655440070';

async function seedDraft(repository) {
  const objective = ClinicalObjective.create({
    id: ClinicalObjectiveId.create(OBJECTIVE_ID),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: '550e8400-e29b-41d4-a716-446655440030',
    responsibleNutritionistId: '550e8400-e29b-41d4-a716-446655440031',
    type: ClinicalObjectiveType.parse('WEIGHT_LOSS'),
    title: ClinicalObjectiveTitle.create('Original title'),
    now: NOW,
  });
  objective.clearDomainEvents();
  await repository.save(objective);
}

describe('EditClinicalObjectiveHandler', () => {
  it('persists only when fields change', async () => {
    const repository = new InMemoryClinicalObjectiveRepository();
    await seedDraft(repository);
    const eventDispatcher = new CapturingEventDispatcher();
    const handler = new EditClinicalObjectiveHandler(
      repository,
      new FixedClock(LATER),
      eventDispatcher,
    );

    const unchanged = await handler.execute(
      new EditClinicalObjectiveCommand({
        tenantId: TENANT_ID,
        clinicalObjectiveId: OBJECTIVE_ID,
        title: 'Original title',
      }),
    );

    assert.equal(unchanged.version, 1);
    assert.equal(eventDispatcher.dispatched.length, 0);

    const changed = await handler.execute(
      new EditClinicalObjectiveCommand({
        tenantId: TENANT_ID,
        clinicalObjectiveId: OBJECTIVE_ID,
        title: 'Updated title',
        priority: ClinicalObjectivePriorityValue.High,
      }),
    );

    assert.equal(changed.title, 'Updated title');
    assert.equal(changed.priority, ClinicalObjectivePriorityValue.High);
    assert.equal(changed.version, 2);
    assert.equal(eventDispatcher.dispatched.length, 1);
  });
});
