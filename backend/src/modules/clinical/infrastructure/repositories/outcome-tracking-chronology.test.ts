import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { OutcomeTracking } from '../../domain/aggregates/outcome-tracking.aggregate.js';
import { DefaultOutcomeRecordingPolicy } from '../../domain/policies/outcome-recording-policy.js';
import { OutcomeAssessment } from '../../domain/value-objects/outcome-assessment.js';
import { ProfessionalRationale } from '../../domain/value-objects/outcome-assessment-text.js';
import { OutcomeTrackingId } from '../../domain/value-objects/outcome-tracking-id.js';
import {
  findLatestRecordedByChronology,
  findPreviousRecordedBeforeChronology,
} from './outcome-tracking-chronology.js';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const OBJECTIVE_ID = '550e8400-e29b-41d4-a716-446655440060';
const EVALUATED_A = new Date('2026-07-10T10:00:00.000Z');
const EVALUATED_B = new Date('2026-07-20T10:00:00.000Z');
const RECORDED_A_LATE = new Date('2026-07-25T18:00:00.000Z');
const RECORDED_B_EARLY = new Date('2026-07-20T11:00:00.000Z');

const policy = new DefaultOutcomeRecordingPolicy();

function createRecordedTracking(options: {
  id: string;
  evaluatedAt: Date;
  recordAt: Date;
  createAt?: Date;
}) {
  const tracking = OutcomeTracking.create({
    id: OutcomeTrackingId.create(options.id),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    clinicalObjectiveId: OBJECTIVE_ID,
    createdByNutritionistId: NUTRITIONIST_ID,
    responsibleNutritionistId: NUTRITIONIST_ID,
    now: options.createAt ?? options.evaluatedAt,
  });

  tracking.edit(
    {
      outcomeAssessment: OutcomeAssessment.parse('ON_TRACK'),
      professionalRationale: ProfessionalRationale.create('Progress documented.'),
      evaluatedAt: options.evaluatedAt,
    },
    options.createAt ?? options.evaluatedAt,
  );
  tracking.record(options.recordAt, policy);

  return tracking;
}

describe('outcome-tracking-chronology', () => {
  it('orders by evaluatedAt rather than recordedAt', () => {
    const olderEvaluation = createRecordedTracking({
      id: '550e8400-e29b-41d4-a716-446655440060',
      evaluatedAt: EVALUATED_A,
      recordAt: RECORDED_A_LATE,
    });
    const newerEvaluation = createRecordedTracking({
      id: '550e8400-e29b-41d4-a716-446655440061',
      evaluatedAt: EVALUATED_B,
      recordAt: RECORDED_B_EARLY,
    });

    const latest = findLatestRecordedByChronology([olderEvaluation, newerEvaluation]);

    assert.equal(latest?.getId().toString(), newerEvaluation.getId().toString());
  });

  it('findPreviousRecordedBeforeChronology returns chronologically prior tracking', () => {
    const olderEvaluation = createRecordedTracking({
      id: '550e8400-e29b-41d4-a716-446655440062',
      evaluatedAt: EVALUATED_A,
      recordAt: RECORDED_A_LATE,
    });
    const newerEvaluation = createRecordedTracking({
      id: '550e8400-e29b-41d4-a716-446655440063',
      evaluatedAt: EVALUATED_B,
      recordAt: RECORDED_B_EARLY,
    });

    const previous = findPreviousRecordedBeforeChronology(
      [olderEvaluation, newerEvaluation],
      EVALUATED_B,
      newerEvaluation.getId().toString(),
    );

    assert.equal(previous?.getId().toString(), olderEvaluation.getId().toString());
  });

  it('returns null when no prior recorded tracking exists', () => {
    const first = createRecordedTracking({
      id: '550e8400-e29b-41d4-a716-446655440064',
      evaluatedAt: EVALUATED_A,
      recordAt: RECORDED_A_LATE,
    });

    const previous = findPreviousRecordedBeforeChronology(
      [first],
      EVALUATED_A,
      first.getId().toString(),
    );

    assert.equal(previous, null);
  });
});
