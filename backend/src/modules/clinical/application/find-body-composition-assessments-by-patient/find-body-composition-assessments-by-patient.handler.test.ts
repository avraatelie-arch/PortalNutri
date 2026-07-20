import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyCompositionAssessment } from '../../domain/aggregates/body-composition-assessment.aggregate.js';
import { BodyCompositionAssessmentId } from '../../domain/value-objects/body-composition-assessment-id.js';
import { BodyCompositionMeasurementSource } from '../../domain/value-objects/body-composition-measurement-source.js';
import { BodyCompositionNotes } from '../../domain/value-objects/body-composition-notes.js';
import { BodyFatPercentage } from '../../domain/value-objects/body-fat-percentage.js';
import { InMemoryBodyCompositionAssessmentRepository } from '../../infrastructure/repositories/in-memory-body-composition-assessment.repository.js';
import { FindBodyCompositionAssessmentsByPatientHandler } from './find-body-composition-assessments-by-patient.handler.js';
import { FindBodyCompositionAssessmentsByPatientQuery } from './find-body-composition-assessments-by-patient.query.js';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';

async function seedAssessment(
  repository: InMemoryBodyCompositionAssessmentRepository,
  overrides: {
    id: string;
    measuredAt: Date;
    createdAt: Date;
  },
) {
  const assessment = BodyCompositionAssessment.create(
    {
      id: BodyCompositionAssessmentId.create(overrides.id),
      tenantId: TENANT_ID,
      anamnesisId: '550e8400-e29b-41d4-a716-446655440060',
      clinicalEncounterId: '550e8400-e29b-41d4-a716-446655440050',
      patientId: PATIENT_ID,
      nutritionistId: '550e8400-e29b-41d4-a716-446655440030',
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
      sourceRequestId: null,
      measuredAt: overrides.measuredAt,
    },
    overrides.createdAt,
  );
  assessment.clearDomainEvents();
  await repository.save(assessment);
}

describe('FindBodyCompositionAssessmentsByPatientHandler', () => {
  it('returns empty collection when no assessments exist', async () => {
    const handler = new FindBodyCompositionAssessmentsByPatientHandler(
      new InMemoryBodyCompositionAssessmentRepository(),
    );

    const results = await handler.execute(
      new FindBodyCompositionAssessmentsByPatientQuery({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
      }),
    );

    assert.deepEqual(results, []);
  });

  it('filters by optional measuredAt date range', async () => {
    const repository = new InMemoryBodyCompositionAssessmentRepository();
    await seedAssessment(repository, {
      id: '550e8400-e29b-41d4-a716-446655440091',
      measuredAt: new Date('2026-07-10T10:00:00.000Z'),
      createdAt: new Date('2026-07-10T10:00:00.000Z'),
    });
    await seedAssessment(repository, {
      id: '550e8400-e29b-41d4-a716-446655440092',
      measuredAt: new Date('2026-07-15T10:00:00.000Z'),
      createdAt: new Date('2026-07-15T10:00:00.000Z'),
    });
    await seedAssessment(repository, {
      id: '550e8400-e29b-41d4-a716-446655440093',
      measuredAt: new Date('2026-07-20T10:00:00.000Z'),
      createdAt: new Date('2026-07-20T10:00:00.000Z'),
    });

    const handler = new FindBodyCompositionAssessmentsByPatientHandler(repository);
    const results = await handler.execute(
      new FindBodyCompositionAssessmentsByPatientQuery({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
        measuredFrom: new Date('2026-07-12T00:00:00.000Z'),
        measuredTo: new Date('2026-07-18T00:00:00.000Z'),
      }),
    );

    assert.equal(results.length, 1);
    assert.equal(results[0]?.id, '550e8400-e29b-41d4-a716-446655440092');
  });
});
