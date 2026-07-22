import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ClinicalObjective } from '../aggregates/clinical-objective.aggregate.js';
import { OutcomeTracking } from '../aggregates/outcome-tracking.aggregate.js';
import { OutcomeRecordingRequirementsNotMetDomainError } from '../errors/outcome-recording-requirements-not-met.domain-error.js';
import { OutcomeTrackingInvalidTransitionDomainError } from '../errors/outcome-tracking-invalid-transition.domain-error.js';
import { OutcomeTrackingNotDraftDomainError } from '../errors/outcome-tracking-not-draft.domain-error.js';
import { OutcomeTrackingTerminalDomainError } from '../errors/outcome-tracking-terminal.domain-error.js';
import {
  OutcomeTrackingCancelled,
  OutcomeTrackingRecorded,
  OutcomeTrackingResponsibleNutritionistChanged,
  OutcomeTrackingStarted,
  OutcomeTrackingUpdated,
} from '../events/outcome-tracking-events.js';
import { DefaultOutcomeRecordingPolicy } from '../policies/outcome-recording-policy.js';
import { AdherenceFactor } from '../value-objects/adherence-factor.js';
import { OutcomeAssessment } from '../value-objects/outcome-assessment.js';
import {
  OutcomeClinicalNotes,
  ProfessionalRationale,
} from '../value-objects/outcome-assessment-text.js';
import { OutcomeTrackingId } from '../value-objects/outcome-tracking-id.js';
import { OutcomeTrackingStatusValue } from '../value-objects/outcome-tracking-status.js';
import { ClinicalObjectiveId } from '../value-objects/clinical-objective-id.js';
import { ClinicalObjectiveStatusValue } from '../value-objects/clinical-objective-status.js';
import { ClinicalObjectiveTitle } from '../value-objects/clinical-objective-title.js';
import { ClinicalObjectiveType } from '../value-objects/clinical-objective-type.js';
import { ClinicalRationale } from '../value-objects/clinical-rationale.js';
import { SuccessCriteria } from '../value-objects/success-criteria.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const NEXT_DAY = new Date('2026-07-21T10:00:00.000Z');
const CLINICAL_MOMENT_AT = new Date('2026-07-20T09:30:00.000Z');
const EVALUATED_AT = new Date('2026-07-20T09:45:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const NEW_RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440032';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const OBJECTIVE_ID = '550e8400-e29b-41d4-a716-446655440060';
const TRACKING_ID = OutcomeTrackingId.create('550e8400-e29b-41d4-a716-446655440070');

const policy = new DefaultOutcomeRecordingPolicy();

function createDraftTracking() {
  return OutcomeTracking.create({
    id: TRACKING_ID,
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    clinicalObjectiveId: OBJECTIVE_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: ENCOUNTER_ID,
    clinicalMomentAt: CLINICAL_MOMENT_AT,
    now: NOW,
  });
}

function prepareForRecord(tracking: OutcomeTracking, at: Date = LATER): void {
  tracking.edit(
    {
      outcomeAssessment: OutcomeAssessment.parse('ON_TRACK'),
      professionalRationale: ProfessionalRationale.create('Patient progressing as expected.'),
      evaluatedAt: EVALUATED_AT,
    },
    at,
  );
}

function recordTracking(tracking: OutcomeTracking, at: Date = LATER): void {
  prepareForRecord(tracking, at);
  tracking.clearDomainEvents();
  tracking.record(at, policy);
}

function createActiveObjective() {
  const objective = ClinicalObjective.create({
    id: ClinicalObjectiveId.create(OBJECTIVE_ID),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    type: ClinicalObjectiveType.parse('WEIGHT_LOSS'),
    title: ClinicalObjectiveTitle.create('Lose 5kg in 3 months'),
    clinicalRationale: ClinicalRationale.create('Reduce visceral adiposity.'),
    successCriteria: SuccessCriteria.create('Waist reduction and improved labs.'),
    now: NOW,
  });

  objective.activate(LATER);
  return objective;
}

function assertEventHasNoClinicalText(event: unknown): void {
  const serialized = JSON.stringify(event);

  assert.doesNotMatch(serialized, /progressing as expected/i);
  assert.doesNotMatch(serialized, /Patient progressing/i);
  assert.doesNotMatch(serialized, /clinical notes/i);
}

describe('OutcomeTracking aggregate', () => {
  it('creates in DRAFT with immutable clinicalMomentAt snapshot and version 1', () => {
    const tracking = createDraftTracking();
    const event = tracking.domainEvents[0] as OutcomeTrackingStarted;

    assert.equal(tracking.getStatus(), OutcomeTrackingStatusValue.Draft);
    assert.equal(tracking.getVersion(), 1);
    assert.deepEqual(tracking.getClinicalMomentAt(), CLINICAL_MOMENT_AT);
    assert.equal(tracking.getClinicalObjectiveId(), OBJECTIVE_ID);
    assert.equal(event.eventName, 'OutcomeTrackingStarted');
    assertEventHasNoClinicalText(event);
  });

  it('edit emits OutcomeTrackingUpdated without clinical text', () => {
    const tracking = createDraftTracking();
    tracking.clearDomainEvents();

    const changed = tracking.edit(
      {
        outcomeAssessment: OutcomeAssessment.parse('PARTIAL'),
        adherenceFactor: AdherenceFactor.parse('LOW'),
        professionalRationale: ProfessionalRationale.create('Patient progressing as expected.'),
        clinicalNotes: OutcomeClinicalNotes.create('Follow up in two weeks.'),
        evaluatedAt: EVALUATED_AT,
      },
      LATER,
    );

    assert.equal(changed, true);
    assert.equal(tracking.getVersion(), 2);

    const event = tracking.domainEvents[0] as OutcomeTrackingUpdated;
    assert.equal(event.eventName, 'OutcomeTrackingUpdated');
    assert.deepEqual(event.changedFields.sort(), [
      'adherenceFactor',
      'clinicalNotes',
      'evaluatedAt',
      'outcomeAssessment',
      'professionalRationale',
    ]);
    assertEventHasNoClinicalText(event);
  });

  it('edit returns false when values are unchanged', () => {
    const tracking = createDraftTracking();
    const props = {
      outcomeAssessment: OutcomeAssessment.parse('STABLE'),
      professionalRationale: ProfessionalRationale.create('Unchanged rationale.'),
    };

    tracking.edit(props, LATER);
    tracking.clearDomainEvents();

    const changed = tracking.edit(props, NEXT_DAY);

    assert.equal(changed, false);
    assert.equal(tracking.getVersion(), 2);
    assert.equal(tracking.domainEvents.length, 0);
  });

  it('records from DRAFT when recording policy requirements are met', () => {
    const tracking = createDraftTracking();
    recordTracking(tracking);

    assert.equal(tracking.getStatus(), OutcomeTrackingStatusValue.Recorded);
    assert.equal(tracking.getVersion(), 3);
    assert.deepEqual(tracking.getEvaluatedAt(), EVALUATED_AT);
    assert.deepEqual(tracking.getRecordedAt(), LATER);

    const event = tracking.domainEvents[0] as OutcomeTrackingRecorded;
    assert.equal(event.eventName, 'OutcomeTrackingRecorded');
    assert.equal(event.outcomeAssessment, 'ON_TRACK');
    assertEventHasNoClinicalText(event);
  });

  it('rejects record when outcomeAssessment is missing', () => {
    const tracking = createDraftTracking();

    assert.throws(
      () => tracking.record(LATER, policy),
      OutcomeRecordingRequirementsNotMetDomainError,
    );
  });

  it('rejects record when NOT_EVALUABLE without professional rationale', () => {
    const tracking = createDraftTracking();

    tracking.edit(
      {
        outcomeAssessment: OutcomeAssessment.parse('NOT_EVALUABLE'),
      },
      LATER,
    );

    assert.throws(
      () => tracking.record(LATER, policy),
      OutcomeRecordingRequirementsNotMetDomainError,
    );
  });

  it('record with GOAL_ACHIEVED does not complete ClinicalObjective', () => {
    const objective = createActiveObjective();
    const tracking = createDraftTracking();

    tracking.edit(
      {
        outcomeAssessment: OutcomeAssessment.parse('GOAL_ACHIEVED'),
        professionalRationale: ProfessionalRationale.create('Target weight reached.'),
        evaluatedAt: EVALUATED_AT,
      },
      LATER,
    );
    tracking.record(LATER, policy);

    assert.equal(tracking.getStatus(), OutcomeTrackingStatusValue.Recorded);
    assert.equal(tracking.getOutcomeAssessment()?.toString(), 'GOAL_ACHIEVED');
    assert.equal(objective.getStatus(), ClinicalObjectiveStatusValue.Active);
    assert.equal(objective.getCompletedAt(), null);
  });

  it('cancels from DRAFT only', () => {
    const tracking = createDraftTracking();
    tracking.clearDomainEvents();

    tracking.cancel(LATER);

    assert.equal(tracking.getStatus(), OutcomeTrackingStatusValue.Cancelled);
    assert.deepEqual(tracking.getCancelledAt(), LATER);

    const event = tracking.domainEvents[0] as OutcomeTrackingCancelled;
    assert.equal(event.eventName, 'OutcomeTrackingCancelled');
    assertEventHasNoClinicalText(event);
  });

  it('rejects edit on RECORDED with OutcomeTrackingNotDraftDomainError', () => {
    const tracking = createDraftTracking();
    recordTracking(tracking);

    assert.throws(
      () =>
        tracking.edit(
          {
            outcomeAssessment: OutcomeAssessment.parse('REGRESSED'),
          },
          NEXT_DAY,
        ),
      OutcomeTrackingNotDraftDomainError,
    );
  });

  it('rejects invalid lifecycle transitions after RECORDED', () => {
    const tracking = createDraftTracking();
    recordTracking(tracking);

    assert.throws(
      () => tracking.record(NEXT_DAY, policy),
      OutcomeTrackingInvalidTransitionDomainError,
    );
    assert.throws(
      () => tracking.cancel(NEXT_DAY),
      OutcomeTrackingInvalidTransitionDomainError,
    );
  });

  it('changeResponsibleNutritionist works on DRAFT and RECORDED', () => {
    const draft = createDraftTracking();
    draft.clearDomainEvents();

    assert.equal(draft.changeResponsibleNutritionist(NEW_RESPONSIBLE_ID, LATER), true);
    assert.equal(draft.getResponsibleNutritionistId(), NEW_RESPONSIBLE_ID);

    const draftEvent =
      draft.domainEvents[0] as OutcomeTrackingResponsibleNutritionistChanged;
    assert.equal(draftEvent.eventName, 'OutcomeTrackingResponsibleNutritionistChanged');
    assertEventHasNoClinicalText(draftEvent);

    const recorded = createDraftTracking();
    recordTracking(recorded);
    recorded.clearDomainEvents();

    assert.equal(
      recorded.changeResponsibleNutritionist(NEW_RESPONSIBLE_ID, NEXT_DAY),
      true,
    );
    assert.equal(recorded.getResponsibleNutritionistId(), NEW_RESPONSIBLE_ID);
  });

  it('rejects mutations in terminal CANCELLED state', () => {
    const cancelled = OutcomeTracking.reconstitute({
      id: TRACKING_ID,
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      clinicalObjectiveId: OBJECTIVE_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      originClinicalEncounterId: ENCOUNTER_ID,
      originAnamnesisId: null,
      clinicalMomentAt: CLINICAL_MOMENT_AT,
      status: OutcomeTrackingStatusValue.Cancelled,
      version: 2,
      outcomeAssessment: null,
      adherenceFactor: null,
      professionalRationale: ProfessionalRationale.empty(),
      clinicalNotes: OutcomeClinicalNotes.empty(),
      evaluatedAt: null,
      recordedAt: null,
      cancelledAt: NEXT_DAY,
      createdAt: NOW,
      updatedAt: NEXT_DAY,
    });

    assert.throws(
      () =>
        cancelled.edit(
          {
            outcomeAssessment: OutcomeAssessment.parse('STABLE'),
          },
          NEXT_DAY,
        ),
      OutcomeTrackingTerminalDomainError,
    );
    assert.throws(
      () => cancelled.cancel(NEXT_DAY),
      OutcomeTrackingTerminalDomainError,
    );
    assert.throws(
      () => cancelled.changeResponsibleNutritionist(NEW_RESPONSIBLE_ID, NEXT_DAY),
      OutcomeTrackingTerminalDomainError,
    );
  });

  it('does not expose getEffectiveAt', () => {
    const tracking = createDraftTracking();

    assert.equal(
      'getEffectiveAt' in tracking
        && typeof (tracking as { getEffectiveAt?: () => Date }).getEffectiveAt === 'function',
      false,
    );
  });
});
