import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyCompositionRecorded } from '../events/body-composition-assessment-events.js';
import { BodyCompositionAssessmentId } from '../value-objects/body-composition-assessment-id.js';
import { BasalMetabolicRate } from '../value-objects/basal-metabolic-rate.js';
import { BodyCompositionMeasurementSource } from '../value-objects/body-composition-measurement-source.js';
import { BodyCompositionNotes } from '../value-objects/body-composition-notes.js';
import { BodyFatPercentage } from '../value-objects/body-fat-percentage.js';
import { BodyWaterPercentage } from '../value-objects/body-water-percentage.js';
import { BoneMass } from '../value-objects/bone-mass.js';
import { ClinicalSourceRequestId } from '../value-objects/clinical-source-request-id.js';
import { FatMass } from '../value-objects/fat-mass.js';
import { LeanMass } from '../value-objects/lean-mass.js';
import { MetabolicAge } from '../value-objects/metabolic-age.js';
import { MuscleMass } from '../value-objects/muscle-mass.js';
import { VisceralFatLevel } from '../value-objects/visceral-fat-level.js';
import { BodyCompositionAssessment } from './body-composition-assessment.aggregate.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const MEASURED_AT = new Date('2026-07-20T09:30:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';
const ANTHROPOMETRIC_ID = '550e8400-e29b-41d4-a716-446655440070';
const ASSESSMENT_ID = BodyCompositionAssessmentId.create(
  '550e8400-e29b-41d4-a716-446655440080',
);

function createProps() {
  return {
    id: ASSESSMENT_ID,
    tenantId: TENANT_ID,
    anamnesisId: ANAMNESIS_ID,
    clinicalEncounterId: ENCOUNTER_ID,
    patientId: PATIENT_ID,
    nutritionistId: NUTRITIONIST_ID,
    anthropometricAssessmentId: ANTHROPOMETRIC_ID,
    bodyFatPercentage: BodyFatPercentage.create('22.50'),
    leanMass: LeanMass.create('50.00'),
    fatMass: FatMass.create('17.25'),
    muscleMass: MuscleMass.create('30.00'),
    boneMass: BoneMass.create('2.75'),
    bodyWaterPercentage: BodyWaterPercentage.create('58.20'),
    visceralFatLevel: VisceralFatLevel.create('8.00'),
    basalMetabolicRate: BasalMetabolicRate.create('1875'),
    metabolicAge: MetabolicAge.create('42'),
    notes: BodyCompositionNotes.create('Device-generated assessment.'),
    measurementSource: BodyCompositionMeasurementSource.parse('BIOIMPEDANCE'),
    sourceRequestId: ClinicalSourceRequestId.createOptional('req-bc-001'),
    measuredAt: MEASURED_AT,
  };
}

function assertEventHasNoMeasurementValues(event: unknown): void {
  const serialized = JSON.stringify(event);

  assert.doesNotMatch(serialized, /22\.50/);
  assert.doesNotMatch(serialized, /50\.00/);
  assert.doesNotMatch(serialized, /17\.25/);
  assert.doesNotMatch(serialized, /30\.00/);
  assert.doesNotMatch(serialized, /1875/);
  assert.doesNotMatch(serialized, /Device-generated assessment/);
}

describe('BodyCompositionAssessment aggregate', () => {
  it('creates immutable assessment with version 1 and emits recorded event', () => {
    const assessment = BodyCompositionAssessment.create(createProps(), NOW);
    const event = assessment.domainEvents[0] as BodyCompositionRecorded;

    assert.equal(assessment.getVersion(), 1);
    assert.equal(assessment.getBodyFatPercentage().toString(), '22.50');
    assert.equal(assessment.getMeasurementSource().toString(), 'BIOIMPEDANCE');
    assert.equal(assessment.getAnthropometricAssessmentId(), ANTHROPOMETRIC_ID);
    assert.equal(assessment.getBasalMetabolicRate()?.toString(), '1875');
    assert.equal(assessment.getMetabolicAge()?.toString(), '42');
    assert.equal(event.eventName, 'BodyCompositionRecorded');
    assert.equal(event.aggregateId, ASSESSMENT_ID.toString());
    assert.equal(event.tenantId, TENANT_ID);
    assert.equal(event.anamnesisId, ANAMNESIS_ID);
    assert.equal(event.anthropometricAssessmentId, ANTHROPOMETRIC_ID);
    assert.equal(event.measurementSource, 'BIOIMPEDANCE');
    assert.equal(event.version, 1);
    assertEventHasNoMeasurementValues(event);
  });

  it('reconstitutes without emitting events', () => {
    const assessment = BodyCompositionAssessment.reconstitute({
      ...createProps(),
      version: 1,
      createdAt: NOW,
    });

    assert.equal(assessment.domainEvents.length, 0);
    assert.equal(assessment.getCreatedAt().toISOString(), NOW.toISOString());
  });
});
