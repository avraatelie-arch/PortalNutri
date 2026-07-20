import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyCompositionAssessment } from '../../domain/aggregates/body-composition-assessment.aggregate.js';
import { BodyCompositionAssessmentId } from '../../domain/value-objects/body-composition-assessment-id.js';
import { BodyCompositionMeasurementSource } from '../../domain/value-objects/body-composition-measurement-source.js';
import { BodyCompositionNotes } from '../../domain/value-objects/body-composition-notes.js';
import { BodyFatPercentage } from '../../domain/value-objects/body-fat-percentage.js';
import { InMemoryBodyCompositionAssessmentRepository } from '../../infrastructure/repositories/in-memory-body-composition-assessment.repository.js';
import { FindBodyCompositionAssessmentsByAnamnesisHandler } from './find-body-composition-assessments-by-anamnesis.handler.js';
import { FindBodyCompositionAssessmentsByAnamnesisQuery } from './find-body-composition-assessments-by-anamnesis.query.js';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';

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
      anamnesisId: ANAMNESIS_ID,
      clinicalEncounterId: '550e8400-e29b-41d4-a716-446655440050',
      patientId: '550e8400-e29b-41d4-a716-446655440020',
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

describe('FindBodyCompositionAssessmentsByAnamnesisHandler', () => {
  it('returns empty collection when no assessments exist', async () => {
    const handler = new FindBodyCompositionAssessmentsByAnamnesisHandler(
      new InMemoryBodyCompositionAssessmentRepository(),
    );

    const results = await handler.execute(
      new FindBodyCompositionAssessmentsByAnamnesisQuery({
        tenantId: TENANT_ID,
        anamnesisId: ANAMNESIS_ID,
      }),
    );

    assert.deepEqual(results, []);
  });

  it('returns assessments ordered by measuredAt desc, createdAt desc, id asc', async () => {
    const repository = new InMemoryBodyCompositionAssessmentRepository();
    await seedAssessment(repository, {
      id: '550e8400-e29b-41d4-a716-446655440081',
      measuredAt: new Date('2026-07-15T10:00:00.000Z'),
      createdAt: new Date('2026-07-15T10:00:00.000Z'),
    });
    await seedAssessment(repository, {
      id: '550e8400-e29b-41d4-a716-446655440082',
      measuredAt: new Date('2026-07-16T10:00:00.000Z'),
      createdAt: new Date('2026-07-16T10:00:00.000Z'),
    });
    await seedAssessment(repository, {
      id: '550e8400-e29b-41d4-a716-446655440083',
      measuredAt: new Date('2026-07-16T10:00:00.000Z'),
      createdAt: new Date('2026-07-16T11:00:00.000Z'),
    });

    const handler = new FindBodyCompositionAssessmentsByAnamnesisHandler(repository);
    const results = await handler.execute(
      new FindBodyCompositionAssessmentsByAnamnesisQuery({
        tenantId: TENANT_ID,
        anamnesisId: ANAMNESIS_ID,
      }),
    );

    assert.equal(results.length, 3);
    assert.equal(results[0]?.id, '550e8400-e29b-41d4-a716-446655440083');
    assert.equal(results[1]?.id, '550e8400-e29b-41d4-a716-446655440082');
    assert.equal(results[2]?.id, '550e8400-e29b-41d4-a716-446655440081');
  });
});
