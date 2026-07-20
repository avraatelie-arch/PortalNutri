import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyCompositionAssessment } from '../../domain/aggregates/body-composition-assessment.aggregate.js';
import { BodyCompositionAssessmentId } from '../../domain/value-objects/body-composition-assessment-id.js';
import { BodyCompositionMeasurementSource } from '../../domain/value-objects/body-composition-measurement-source.js';
import { BodyCompositionNotes } from '../../domain/value-objects/body-composition-notes.js';
import { BodyFatPercentage } from '../../domain/value-objects/body-fat-percentage.js';
import { ClinicalSourceRequestId } from '../../domain/value-objects/clinical-source-request-id.js';
import { InMemoryBodyCompositionAssessmentRepository } from './in-memory-body-composition-assessment.repository.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const EARLIER = new Date('2026-07-16T10:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const NUTRITIONIST_ID = '550e8400-e29b-41d4-a716-446655440030';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';
const ASSESSMENT_ID_ONE = '550e8400-e29b-41d4-a716-446655440070';
const ASSESSMENT_ID_TWO = '550e8400-e29b-41d4-a716-446655440071';

function createAssessment(params: {
  id: string;
  tenantId?: string;
  anamnesisId?: string;
  patientId?: string;
  measuredAt?: Date;
  createdAt?: Date;
  sourceRequestId?: string | null;
}) {
  const measuredAt = params.measuredAt ?? NOW;

  const assessment = BodyCompositionAssessment.create(
    {
      id: BodyCompositionAssessmentId.create(params.id),
      tenantId: params.tenantId ?? TENANT_ID,
      anamnesisId: params.anamnesisId ?? ANAMNESIS_ID,
      clinicalEncounterId: ENCOUNTER_ID,
      patientId: params.patientId ?? PATIENT_ID,
      nutritionistId: NUTRITIONIST_ID,
      anthropometricAssessmentId: null,
      bodyFatPercentage: BodyFatPercentage.create('22.50'),
      leanMass: null,
      fatMass: null,
      muscleMass: null,
      boneMass: null,
      bodyWaterPercentage: null,
      visceralFatLevel: null,
      basalMetabolicRate: null,
      metabolicAge: null,
      notes: BodyCompositionNotes.create(null),
      measurementSource: BodyCompositionMeasurementSource.parse('BIOIMPEDANCE'),
      sourceRequestId: params.sourceRequestId
        ? ClinicalSourceRequestId.createOptional(params.sourceRequestId)
        : null,
      measuredAt,
    },
    params.createdAt ?? NOW,
  );
  assessment.clearDomainEvents();
  return assessment;
}

describe('InMemoryBodyCompositionAssessmentRepository', () => {
  it('finds assessment by tenant and id', async () => {
    const repository = new InMemoryBodyCompositionAssessmentRepository();
    await repository.save(createAssessment({ id: ASSESSMENT_ID_ONE }));

    const found = await repository.findByTenantAndId(
      TENANT_ID,
      BodyCompositionAssessmentId.create(ASSESSMENT_ID_ONE),
    );

    assert.ok(found);
    assert.equal(found.getId().toString(), ASSESSMENT_ID_ONE);
  });

  it('returns null for wrong tenant in findByTenantAndId', async () => {
    const repository = new InMemoryBodyCompositionAssessmentRepository();
    await repository.save(createAssessment({ id: ASSESSMENT_ID_ONE }));

    const found = await repository.findByTenantAndId(
      OTHER_TENANT_ID,
      BodyCompositionAssessmentId.create(ASSESSMENT_ID_ONE),
    );

    assert.equal(found, null);
  });

  it('finds assessments by anamnesis with deterministic ordering', async () => {
    const repository = new InMemoryBodyCompositionAssessmentRepository();
    await repository.save(
      createAssessment({
        id: ASSESSMENT_ID_ONE,
        measuredAt: EARLIER,
        createdAt: EARLIER,
      }),
    );
    await repository.save(
      createAssessment({
        id: ASSESSMENT_ID_TWO,
        measuredAt: NOW,
        createdAt: NOW,
      }),
    );

    const results = await repository.findByAnamnesis(TENANT_ID, ANAMNESIS_ID);

    assert.equal(results.length, 2);
    assert.equal(results[0]?.getId().toString(), ASSESSMENT_ID_TWO);
    assert.equal(results[1]?.getId().toString(), ASSESSMENT_ID_ONE);
  });

  it('finds assessments by patient with optional date range', async () => {
    const repository = new InMemoryBodyCompositionAssessmentRepository();
    await repository.save(
      createAssessment({
        id: ASSESSMENT_ID_ONE,
        measuredAt: EARLIER,
        createdAt: EARLIER,
      }),
    );
    await repository.save(
      createAssessment({
        id: ASSESSMENT_ID_TWO,
        measuredAt: NOW,
        createdAt: NOW,
      }),
    );

    const filtered = await repository.findByPatient(TENANT_ID, PATIENT_ID, {
      from: NOW,
      to: NOW,
    });

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0]?.getId().toString(), ASSESSMENT_ID_TWO);
  });

  it('reports existence by source request id within tenant', async () => {
    const repository = new InMemoryBodyCompositionAssessmentRepository();
    await repository.save(
      createAssessment({
        id: ASSESSMENT_ID_ONE,
        sourceRequestId: 'req-001',
      }),
    );

    assert.equal(await repository.existsBySourceRequestId(TENANT_ID, 'req-001'), true);
    assert.equal(await repository.existsBySourceRequestId(TENANT_ID, 'req-999'), false);
    assert.equal(await repository.existsBySourceRequestId(OTHER_TENANT_ID, 'req-001'), false);
  });

  it('allows multiple assessments without source request id', async () => {
    const repository = new InMemoryBodyCompositionAssessmentRepository();
    await repository.save(createAssessment({ id: ASSESSMENT_ID_ONE }));
    await repository.save(createAssessment({ id: ASSESSMENT_ID_TWO }));

    const results = await repository.findByAnamnesis(TENANT_ID, ANAMNESIS_ID);
    assert.equal(results.length, 2);
  });
});
