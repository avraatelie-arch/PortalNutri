import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { ClinicalObjectiveInvalidTransitionDomainError } from '../errors/clinical-objective-invalid-transition.domain-error.js';
import { ClinicalObjectiveTerminalDomainError } from '../errors/clinical-objective-terminal.domain-error.js';
import { ClinicalObjectiveTitleRequiredDomainError } from '../errors/clinical-objective-title-required.domain-error.js';
import { ClinicalObjectiveTargetDateInvalidDomainError } from '../errors/clinical-objective-target-date-invalid.domain-error.js';
import {
  ClinicalObjectiveActivated,
  ClinicalObjectiveCancelled,
  ClinicalObjectiveCompleted,
  ClinicalObjectiveCreated,
  ClinicalObjectivePaused,
  ClinicalObjectiveResponsibleNutritionistChanged,
  ClinicalObjectiveResumed,
  ClinicalObjectiveUpdated,
} from '../events/clinical-objective-events.js';
import { ClinicalObjectiveId } from '../value-objects/clinical-objective-id.js';
import {
  ClinicalObjectivePriorityValue,
} from '../value-objects/clinical-objective-priority.js';
import { ClinicalObjectiveStatusValue } from '../value-objects/clinical-objective-status.js';
import { ClinicalObjectiveTitle } from '../value-objects/clinical-objective-title.js';
import { ClinicalObjectiveType } from '../value-objects/clinical-objective-type.js';
import { ClinicalRationale } from '../value-objects/clinical-rationale.js';
import { SuccessCriteria } from '../value-objects/success-criteria.js';
import { ClinicalObjective } from './clinical-objective.aggregate.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const NEXT_DAY = new Date('2026-07-21T10:00:00.000Z');
const PREVIOUS_DAY = new Date('2026-07-19T10:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const NEW_RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440032';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';
const OBJECTIVE_ID = ClinicalObjectiveId.create(
  '550e8400-e29b-41d4-a716-446655440070',
);

const OBJECTIVE_TYPE = ClinicalObjectiveType.parse('WEIGHT_LOSS');

function createDraftObjective(params?: {
  title?: ClinicalObjectiveTitle;
  targetDate?: Date | null;
}) {
  const clock = new FixedClock(NOW);

  return ClinicalObjective.create({
    id: OBJECTIVE_ID,
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: ENCOUNTER_ID,
    originAnamnesisId: ANAMNESIS_ID,
    type: OBJECTIVE_TYPE,
    title: params?.title,
    clinicalRationale: ClinicalRationale.create('Reduce visceral adiposity.'),
    successCriteria: SuccessCriteria.create('Waist reduction and improved labs.'),
    targetDate: params?.targetDate ?? NEXT_DAY,
    now: clock.now(),
  });
}

function activateObjective(objective: ClinicalObjective, at: Date = LATER): void {
  objective.clearDomainEvents();

  if (objective.getTitle().isEmpty()) {
    objective.edit(
      {
        title: ClinicalObjectiveTitle.create('Lose 5kg in 3 months'),
      },
      at,
    );
    objective.clearDomainEvents();
  }

  objective.activate(at);
}

function reconstituteObjective(params: {
  status: (typeof ClinicalObjectiveStatusValue)[keyof typeof ClinicalObjectiveStatusValue];
  version?: number;
  title?: ClinicalObjectiveTitle;
  targetDate?: Date | null;
  activatedAt?: Date | null;
  pausedAt?: Date | null;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
}) {
  return ClinicalObjective.reconstitute({
    id: OBJECTIVE_ID,
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: ENCOUNTER_ID,
    originAnamnesisId: ANAMNESIS_ID,
    type: OBJECTIVE_TYPE,
    status: params.status,
    priority: ClinicalObjectivePriorityValue.Medium,
    version: params.version ?? 1,
    title: params.title ?? ClinicalObjectiveTitle.create('Existing title'),
    clinicalRationale: ClinicalRationale.create('Existing rationale text'),
    successCriteria: SuccessCriteria.create('Existing success criteria text'),
    targetDate: params.targetDate ?? NEXT_DAY,
    activatedAt: params.activatedAt ?? null,
    pausedAt: params.pausedAt ?? null,
    completedAt: params.completedAt ?? null,
    cancelledAt: params.cancelledAt ?? null,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

function assertEventHasNoClinicalText(event: unknown): void {
  const serialized = JSON.stringify(event);

  assert.doesNotMatch(serialized, /Reduce visceral adiposity/i);
  assert.doesNotMatch(serialized, /Waist reduction and improved labs/i);
  assert.doesNotMatch(serialized, /Lose 5kg in 3 months/i);
  assert.doesNotMatch(serialized, /Existing rationale text/i);
  assert.doesNotMatch(serialized, /Existing success criteria text/i);
  assert.doesNotMatch(serialized, /Existing title/i);
  assert.doesNotMatch(serialized, /Updated title/i);
}

describe('ClinicalObjective aggregate', () => {
  it('creates in DRAFT with version 1 and publishes ClinicalObjectiveCreated', () => {
    const objective = createDraftObjective({
      title: ClinicalObjectiveTitle.create(''),
    });
    const event = objective.domainEvents[0] as ClinicalObjectiveCreated;

    assert.equal(objective.getStatus(), ClinicalObjectiveStatusValue.Draft);
    assert.equal(objective.getVersion(), 1);
    assert.equal(objective.getPriority(), ClinicalObjectivePriorityValue.Medium);
    assert.equal(objective.getOriginClinicalEncounterId(), ENCOUNTER_ID);
    assert.equal(objective.getOriginAnamnesisId(), ANAMNESIS_ID);
    assert.equal(event.eventName, 'ClinicalObjectiveCreated');
    assert.equal(event.aggregateId, OBJECTIVE_ID.toString());
    assert.equal(event.type, 'WEIGHT_LOSS');
    assertEventHasNoClinicalText(event);
  });

  it('allows empty title in DRAFT', () => {
    const objective = createDraftObjective({
      title: ClinicalObjectiveTitle.create(''),
    });

    assert.equal(objective.getTitle().isEmpty(), true);
  });

  it('activates from DRAFT with title and increments version', () => {
    const objective = createDraftObjective({
      title: ClinicalObjectiveTitle.create('Lose 5kg in 3 months'),
    });
    objective.clearDomainEvents();

    objective.activate(LATER);

    assert.equal(objective.getStatus(), ClinicalObjectiveStatusValue.Active);
    assert.equal(objective.getVersion(), 2);
    assert.deepEqual(objective.getActivatedAt(), LATER);

    const event = objective.domainEvents[0] as ClinicalObjectiveActivated;
    assert.equal(event.eventName, 'ClinicalObjectiveActivated');
    assert.equal(event.version, 2);
    assertEventHasNoClinicalText(event);
  });

  it('rejects activation without title', () => {
    const objective = createDraftObjective({
      title: ClinicalObjectiveTitle.create(''),
    });

    assert.throws(
      () => objective.activate(LATER),
      ClinicalObjectiveTitleRequiredDomainError,
    );
  });

  it('rejects activation when target date is before activation day', () => {
    const objective = createDraftObjective({
      title: ClinicalObjectiveTitle.create('Lose 5kg in 3 months'),
      targetDate: PREVIOUS_DAY,
    });

    assert.throws(
      () => objective.activate(LATER),
      ClinicalObjectiveTargetDateInvalidDomainError,
    );
  });

  it('allows activation when target date is the same day as activation', () => {
    const objective = createDraftObjective({
      title: ClinicalObjectiveTitle.create('Lose 5kg in 3 months'),
      targetDate: new Date('2026-07-20T23:59:59.000Z'),
    });
    objective.clearDomainEvents();

    objective.activate(LATER);

    assert.equal(objective.getStatus(), ClinicalObjectiveStatusValue.Active);
  });

  it('runs ACTIVE to PAUSED to ACTIVE lifecycle', () => {
    const objective = createDraftObjective({
      title: ClinicalObjectiveTitle.create('Lose 5kg in 3 months'),
    });
    activateObjective(objective);
    objective.clearDomainEvents();

    objective.pause(LATER);

    assert.equal(objective.getStatus(), ClinicalObjectiveStatusValue.Paused);
    assert.equal(objective.getVersion(), 3);
    assert.deepEqual(objective.getPausedAt(), LATER);

    const pausedEvent = objective.domainEvents[0] as ClinicalObjectivePaused;
    assert.equal(pausedEvent.eventName, 'ClinicalObjectivePaused');
    assertEventHasNoClinicalText(pausedEvent);

    objective.clearDomainEvents();
    objective.resume(NEXT_DAY);

    assert.equal(objective.getStatus(), ClinicalObjectiveStatusValue.Active);
    assert.equal(objective.getVersion(), 4);
    assert.equal(objective.getPausedAt(), null);

    const resumedEvent = objective.domainEvents[0] as ClinicalObjectiveResumed;
    assert.equal(resumedEvent.eventName, 'ClinicalObjectiveResumed');
    assertEventHasNoClinicalText(resumedEvent);
  });

  it('completes from ACTIVE and sets completedAt', () => {
    const objective = createDraftObjective({
      title: ClinicalObjectiveTitle.create('Lose 5kg in 3 months'),
    });
    activateObjective(objective);
    objective.clearDomainEvents();

    objective.complete(LATER);

    assert.equal(objective.getStatus(), ClinicalObjectiveStatusValue.Completed);
    assert.equal(objective.getVersion(), 3);
    assert.deepEqual(objective.getCompletedAt(), LATER);

    const event = objective.domainEvents[0] as ClinicalObjectiveCompleted;
    assert.equal(event.eventName, 'ClinicalObjectiveCompleted');
    assertEventHasNoClinicalText(event);
  });

  it('cancels from DRAFT, ACTIVE and PAUSED', () => {
    const draft = createDraftObjective({
      title: ClinicalObjectiveTitle.create('Draft objective'),
    });
    draft.clearDomainEvents();
    draft.cancel(LATER);
    assert.equal(draft.getStatus(), ClinicalObjectiveStatusValue.Cancelled);

    const active = createDraftObjective({
      title: ClinicalObjectiveTitle.create('Active objective'),
    });
    activateObjective(active);
    active.clearDomainEvents();
    active.cancel(LATER);
    assert.equal(active.getStatus(), ClinicalObjectiveStatusValue.Cancelled);

    const paused = createDraftObjective({
      title: ClinicalObjectiveTitle.create('Paused objective'),
    });
    activateObjective(paused);
    paused.pause(LATER);
    paused.clearDomainEvents();
    paused.cancel(NEXT_DAY);
    assert.equal(paused.getStatus(), ClinicalObjectiveStatusValue.Cancelled);
  });

  it('rejects invalid lifecycle transitions', () => {
    const objective = createDraftObjective({
      title: ClinicalObjectiveTitle.create('Lose 5kg in 3 months'),
    });

    assert.throws(
      () => objective.pause(LATER),
      ClinicalObjectiveInvalidTransitionDomainError,
    );

    activateObjective(objective);

    assert.throws(
      () => objective.activate(LATER),
      ClinicalObjectiveInvalidTransitionDomainError,
    );
    assert.throws(
      () => objective.resume(LATER),
      ClinicalObjectiveInvalidTransitionDomainError,
    );
  });

  it('rejects mutations in terminal states', () => {
    const completed = reconstituteObjective({
      status: ClinicalObjectiveStatusValue.Completed,
      activatedAt: LATER,
      completedAt: NEXT_DAY,
    });

    assert.throws(
      () => completed.edit({ priority: ClinicalObjectivePriorityValue.High }, NEXT_DAY),
      ClinicalObjectiveTerminalDomainError,
    );
    assert.throws(
      () => completed.changeResponsibleNutritionist(NEW_RESPONSIBLE_ID, NEXT_DAY),
      ClinicalObjectiveTerminalDomainError,
    );
    assert.throws(() => completed.cancel(NEXT_DAY), ClinicalObjectiveTerminalDomainError);

    const cancelled = reconstituteObjective({
      status: ClinicalObjectiveStatusValue.Cancelled,
      cancelledAt: NEXT_DAY,
    });

    assert.throws(
      () => cancelled.edit({ priority: ClinicalObjectivePriorityValue.High }, NEXT_DAY),
      ClinicalObjectiveTerminalDomainError,
    );
  });

  it('edit returns changed field names and emits ClinicalObjectiveUpdated without text', () => {
    const objective = createDraftObjective({
      title: ClinicalObjectiveTitle.create('Existing title'),
    });
    objective.clearDomainEvents();

    const changedFields = objective.edit(
      {
        title: ClinicalObjectiveTitle.create('Updated title'),
        clinicalRationale: ClinicalRationale.create('Updated rationale'),
        priority: ClinicalObjectivePriorityValue.High,
      },
      LATER,
    );

    assert.deepEqual(changedFields, ['title', 'clinicalRationale', 'priority']);
    assert.equal(objective.getVersion(), 2);

    const event = objective.domainEvents[0] as ClinicalObjectiveUpdated;
    assert.equal(event.eventName, 'ClinicalObjectiveUpdated');
    assert.deepEqual(event.changedFields, ['title', 'clinicalRationale', 'priority']);
    assertEventHasNoClinicalText(event);
  });

  it('edit is idempotent when values are unchanged', () => {
    const title = ClinicalObjectiveTitle.create('Same title');
    const rationale = ClinicalRationale.create('Reduce visceral adiposity.');
    const objective = createDraftObjective({ title });
    objective.clearDomainEvents();

    const changedFields = objective.edit(
      {
        title,
        clinicalRationale: rationale,
      },
      LATER,
    );

    assert.deepEqual(changedFields, []);
    assert.equal(objective.getVersion(), 1);
    assert.equal(objective.domainEvents.length, 0);
  });

  it('edit validates target date against activation date when already active', () => {
    const objective = createDraftObjective({
      title: ClinicalObjectiveTitle.create('Active objective'),
      targetDate: NEXT_DAY,
    });
    activateObjective(objective, LATER);
    objective.clearDomainEvents();

    assert.throws(
      () =>
        objective.edit(
          {
            targetDate: PREVIOUS_DAY,
          },
          NEXT_DAY,
        ),
      ClinicalObjectiveTargetDateInvalidDomainError,
    );
  });

  it('changeResponsibleNutritionist updates owner and emits event', () => {
    const objective = createDraftObjective({
      title: ClinicalObjectiveTitle.create('Draft objective'),
    });
    objective.clearDomainEvents();

    const changed = objective.changeResponsibleNutritionist(NEW_RESPONSIBLE_ID, LATER);

    assert.equal(changed, true);
    assert.equal(objective.getResponsibleNutritionistId(), NEW_RESPONSIBLE_ID);
    assert.equal(objective.getVersion(), 2);

    const event =
      objective.domainEvents[0] as ClinicalObjectiveResponsibleNutritionistChanged;
    assert.equal(event.eventName, 'ClinicalObjectiveResponsibleNutritionistChanged');
    assert.equal(event.responsibleNutritionistId, NEW_RESPONSIBLE_ID);
    assertEventHasNoClinicalText(event);
  });

  it('changeResponsibleNutritionist is idempotent when unchanged', () => {
    const objective = createDraftObjective({
      title: ClinicalObjectiveTitle.create('Draft objective'),
    });
    objective.clearDomainEvents();

    const changed = objective.changeResponsibleNutritionist(RESPONSIBLE_ID, LATER);

    assert.equal(changed, false);
    assert.equal(objective.getVersion(), 1);
    assert.equal(objective.domainEvents.length, 0);
  });

  it('does not expose clinical text in lifecycle events after edits', () => {
    const objective = createDraftObjective({
      title: ClinicalObjectiveTitle.create('Sensitive clinical title'),
    });

    for (const event of objective.domainEvents) {
      assertEventHasNoClinicalText(event);
    }

    objective.edit(
      {
        title: ClinicalObjectiveTitle.create('Updated sensitive title'),
        clinicalRationale: ClinicalRationale.create('Private rationale details'),
        successCriteria: SuccessCriteria.create('Private success criteria details'),
      },
      LATER,
    );
    activateObjective(objective, NEXT_DAY);
    objective.pause(NEXT_DAY);
    objective.resume(NEXT_DAY);
    objective.complete(NEXT_DAY);

    for (const event of objective.domainEvents) {
      assertEventHasNoClinicalText(event);
    }
  });

  it('cancel emits ClinicalObjectiveCancelled without clinical text', () => {
    const objective = createDraftObjective({
      title: ClinicalObjectiveTitle.create('Draft objective'),
    });
    objective.clearDomainEvents();

    objective.cancel(LATER);

    const event = objective.domainEvents[0] as ClinicalObjectiveCancelled;
    assert.equal(event.eventName, 'ClinicalObjectiveCancelled');
    assertEventHasNoClinicalText(event);
  });
});

describe('ClinicalObjectiveTitle', () => {
  it('createForActivation requires non-empty title', () => {
    assert.throws(
      () => ClinicalObjectiveTitle.createForActivation('   '),
      ClinicalObjectiveTitleRequiredDomainError,
    );
  });
});
