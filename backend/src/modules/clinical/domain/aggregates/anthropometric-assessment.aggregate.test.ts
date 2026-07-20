import { Decimal } from '@prisma/client/runtime/library';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  AnthropometricAssessmentRecorded,
} from '../events/anthropometric-assessment-events.js';
import { AnthropometricAssessmentId } from '../value-objects/anthropometric-assessment-id.js';
import { AnthropometricNotes } from '../value-objects/anthropometric-notes.js';
import { BodyCircumference } from '../value-objects/body-circumference.js';
import { BodyHeight } from '../value-objects/body-height.js';
import { BodyMassIndex } from '../value-objects/body-mass-index.js';
import { BodyMassIndexClassification } from '../value-objects/body-mass-index-classification.js';
import { BodyWeight } from '../value-objects/body-weight.js';
import { ClinicalSourceRequestId } from '../value-objects/clinical-source-request-id.js';
import { WaistToHipRatio } from '../value-objects/waist-to-hip-ratio.js';
import { AnthropometricAssessment } from './anthropometric-assessment.aggregate.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const MEASURED_AT = new Date('2026-07-20T09:30:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';
const ASSESSMENT_ID = AnthropometricAssessmentId.create(
  '550e8400-e29b-41d4-a716-446655440070',
);

function createProps() {
  return {
    id: ASSESSMENT_ID,
    tenantId: TENANT_ID,
    anamnesisId: ANAMNESIS_ID,
    clinicalEncounterId: ENCOUNTER_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    weight: BodyWeight.create('72.5'),
    height: BodyHeight.create('170'),
    bodyMassIndex: BodyMassIndex.fromDecimal(new Decimal('25.09')),
    bodyMassIndexClassification: BodyMassIndexClassification.Overweight,
    waistCircumference: BodyCircumference.create('88', 'waistCircumferenceCm'),
    hipCircumference: BodyCircumference.create('100', 'hipCircumferenceCm'),
    abdominalCircumference: null,
    neckCircumference: null,
    armCircumference: null,
    calfCircumference: null,
    waistToHipRatio: WaistToHipRatio.fromDecimal(new Decimal('0.880')),
    notes: AnthropometricNotes.create('Patient measured standing.'),
    sourceRequestId: ClinicalSourceRequestId.createOptional('req-001'),
    measuredAt: MEASURED_AT,
  };
}

function assertEventHasNoMeasurementValues(event: unknown): void {
  const serialized = JSON.stringify(event);

  assert.doesNotMatch(serialized, /72\.5/);
  assert.doesNotMatch(serialized, /170/);
  assert.doesNotMatch(serialized, /25\.09/);
  assert.doesNotMatch(serialized, /0\.880/);
  assert.doesNotMatch(serialized, /Patient measured standing/);
}

describe('AnthropometricAssessment aggregate', () => {
  it('creates immutable assessment with version 1 and emits recorded event', () => {
    const assessment = AnthropometricAssessment.create(createProps(), NOW);
    const event = assessment.domainEvents[0] as AnthropometricAssessmentRecorded;

    assert.equal(assessment.getVersion(), 1);
    assert.equal(assessment.getWeight().toString(), '72.50');
    assert.equal(assessment.getBodyMassIndex().toString(), '25.09');
    assert.equal(
      assessment.getBodyMassIndexClassification(),
      BodyMassIndexClassification.Overweight,
    );
    assert.equal(assessment.getWaistToHipRatio()?.toString(), '0.880');
    assert.equal(event.eventName, 'AnthropometricAssessmentRecorded');
    assert.equal(event.aggregateId, ASSESSMENT_ID.toString());
    assert.equal(event.tenantId, TENANT_ID);
    assert.equal(event.anamnesisId, ANAMNESIS_ID);
    assert.equal(event.version, 1);
    assertEventHasNoMeasurementValues(event);
  });

  it('reconstitutes without emitting events', () => {
    const assessment = AnthropometricAssessment.reconstitute({
      ...createProps(),
      version: 1,
      createdAt: NOW,
    });

    assert.equal(assessment.domainEvents.length, 0);
    assert.equal(assessment.getCreatedAt().toISOString(), NOW.toISOString());
  });
});
