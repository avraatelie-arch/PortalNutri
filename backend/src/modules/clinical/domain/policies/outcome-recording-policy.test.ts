import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { OutcomeTracking } from '../aggregates/outcome-tracking.aggregate.js';
import { OutcomeRecordingRequirementsNotMetDomainError } from '../errors/outcome-recording-requirements-not-met.domain-error.js';
import { OutcomeTrackingId } from '../value-objects/outcome-tracking-id.js';
import { OutcomeTrackingStatusValue } from '../value-objects/outcome-tracking-status.js';
import { OutcomeAssessment } from '../value-objects/outcome-assessment.js';
import {
  OutcomeClinicalNotes,
  ProfessionalRationale,
} from '../value-objects/outcome-assessment-text.js';
import { DefaultOutcomeRecordingPolicy } from './outcome-recording-policy.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const CLINICAL_MOMENT_AT = new Date('2026-07-20T09:30:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const OBJECTIVE_ID = '550e8400-e29b-41d4-a716-446655440060';
const TRACKING_ID = OutcomeTrackingId.create('550e8400-e29b-41d4-a716-446655440070');

function reconstituteTracking(sections: {
  outcomeAssessment?: OutcomeAssessment | null;
  professionalRationale?: ProfessionalRationale;
}) {
  return OutcomeTracking.reconstitute({
    id: TRACKING_ID,
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    clinicalObjectiveId: OBJECTIVE_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: ENCOUNTER_ID,
    originAnamnesisId: null,
    clinicalMomentAt: CLINICAL_MOMENT_AT,
    status: OutcomeTrackingStatusValue.Draft,
    version: 1,
    outcomeAssessment: sections.outcomeAssessment ?? null,
    adherenceFactor: null,
    professionalRationale: sections.professionalRationale ?? ProfessionalRationale.empty(),
    clinicalNotes: OutcomeClinicalNotes.empty(),
    evaluatedAt: null,
    recordedAt: null,
    cancelledAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

describe('DefaultOutcomeRecordingPolicy', () => {
  const policy = new DefaultOutcomeRecordingPolicy();

  it('passes when outcomeAssessment is defined', () => {
    const tracking = reconstituteTracking({
      outcomeAssessment: OutcomeAssessment.parse('ON_TRACK'),
    });

    assert.doesNotThrow(() => policy.validate(tracking));
  });

  it('throws when outcomeAssessment is missing', () => {
    const tracking = reconstituteTracking({});

    assert.throws(
      () => policy.validate(tracking),
      OutcomeRecordingRequirementsNotMetDomainError,
    );
  });

  it('throws when NOT_EVALUABLE without professional rationale', () => {
    const tracking = reconstituteTracking({
      outcomeAssessment: OutcomeAssessment.parse('NOT_EVALUABLE'),
    });

    assert.throws(
      () => policy.validate(tracking),
      OutcomeRecordingRequirementsNotMetDomainError,
    );
  });

  it('passes when NOT_EVALUABLE with professional rationale', () => {
    const tracking = reconstituteTracking({
      outcomeAssessment: OutcomeAssessment.parse('NOT_EVALUABLE'),
      professionalRationale: ProfessionalRationale.create(
        'Insufficient data to evaluate progress at this time.',
      ),
    });

    assert.doesNotThrow(() => policy.validate(tracking));
  });
});
