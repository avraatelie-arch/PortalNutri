import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { AnthropometricAssessment } from '../../domain/aggregates/anthropometric-assessment.aggregate.js';
import { BodyMassIndexCalculator } from '../../domain/services/body-mass-index-calculator.js';
import { AnthropometricAssessmentId } from '../../domain/value-objects/anthropometric-assessment-id.js';
import { AnthropometricNotes } from '../../domain/value-objects/anthropometric-notes.js';
import { BodyHeight } from '../../domain/value-objects/body-height.js';
import { BodyMassIndexClassification } from '../../domain/value-objects/body-mass-index-classification.js';
import { BodyWeight } from '../../domain/value-objects/body-weight.js';
import { InMemoryAnthropometricAssessmentRepository } from '../../infrastructure/repositories/in-memory-anthropometric-assessment.repository.js';
import { FindAnthropometricAssessmentsByAnamnesisHandler } from './find-anthropometric-assessments-by-anamnesis.handler.js';
import { FindAnthropometricAssessmentsByAnamnesisQuery } from './find-anthropometric-assessments-by-anamnesis.query.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';

async function seedAssessment(
  repository: InMemoryAnthropometricAssessmentRepository,
  overrides: {
    id: string;
    measuredAt: Date;
    createdAt: Date;
  },
) {
  const calculator = new BodyMassIndexCalculator();
  const weight = BodyWeight.create('72.50');
  const height = BodyHeight.create('170.00');
  const assessment = AnthropometricAssessment.create(
    {
      id: AnthropometricAssessmentId.create(overrides.id),
      tenantId: TENANT_ID,
      anamnesisId: ANAMNESIS_ID,
      clinicalEncounterId: '550e8400-e29b-41d4-a716-446655440050',
      patientId: '550e8400-e29b-41d4-a716-446655440020',
      nutritionistId: '550e8400-e29b-41d4-a716-446655440030',
      weight,
      height,
      bodyMassIndex: calculator.calculate(weight, height),
      bodyMassIndexClassification: BodyMassIndexClassification.Overweight,
      waistCircumference: null,
      hipCircumference: null,
      abdominalCircumference: null,
      neckCircumference: null,
      armCircumference: null,
      calfCircumference: null,
      waistToHipRatio: null,
      notes: AnthropometricNotes.create(null),
      sourceRequestId: null,
      measuredAt: overrides.measuredAt,
    },
    overrides.createdAt,
  );
  assessment.clearDomainEvents();
  await repository.save(assessment);
}

describe('FindAnthropometricAssessmentsByAnamnesisHandler', () => {
  it('returns empty collection when no assessments exist', async () => {
    const handler = new FindAnthropometricAssessmentsByAnamnesisHandler(
      new InMemoryAnthropometricAssessmentRepository(),
    );

    const results = await handler.execute(
      new FindAnthropometricAssessmentsByAnamnesisQuery({
        tenantId: TENANT_ID,
        anamnesisId: ANAMNESIS_ID,
      }),
    );

    assert.deepEqual(results, []);
  });

  it('returns assessments ordered by measuredAt desc, createdAt desc, id asc', async () => {
    const repository = new InMemoryAnthropometricAssessmentRepository();
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

    const handler = new FindAnthropometricAssessmentsByAnamnesisHandler(repository);
    const results = await handler.execute(
      new FindAnthropometricAssessmentsByAnamnesisQuery({
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
