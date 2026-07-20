import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BodyCompositionAssessment } from '../../domain/aggregates/body-composition-assessment.aggregate.js';
import { BodyCompositionAssessmentId } from '../../domain/value-objects/body-composition-assessment-id.js';
import { BodyCompositionMeasurementSource } from '../../domain/value-objects/body-composition-measurement-source.js';
import { BodyCompositionNotes } from '../../domain/value-objects/body-composition-notes.js';
import { BodyFatPercentage } from '../../domain/value-objects/body-fat-percentage.js';
import { InMemoryBodyCompositionAssessmentRepository } from '../../infrastructure/repositories/in-memory-body-composition-assessment.repository.js';
import { BodyCompositionAssessmentNotFoundError } from '../errors/body-composition-assessment-not-found.error.js';
import { FindBodyCompositionAssessmentHandler } from './find-body-composition-assessment.handler.js';
import { FindBodyCompositionAssessmentQuery } from './find-body-composition-assessment.query.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const ASSESSMENT_ID = '550e8400-e29b-41d4-a716-446655440080';

async function seedAssessment(
  repository: InMemoryBodyCompositionAssessmentRepository,
  overrides?: { tenantId?: string },
) {
  const assessment = BodyCompositionAssessment.create(
    {
      id: BodyCompositionAssessmentId.create(ASSESSMENT_ID),
      tenantId: overrides?.tenantId ?? TENANT_ID,
      anamnesisId: '550e8400-e29b-41d4-a716-446655440060',
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
      measuredAt: NOW,
    },
    NOW,
  );
  assessment.clearDomainEvents();
  await repository.save(assessment);
  return assessment;
}

describe('FindBodyCompositionAssessmentHandler', () => {
  it('finds assessment scoped to tenant with decimal strings', async () => {
    const repository = new InMemoryBodyCompositionAssessmentRepository();
    await seedAssessment(repository);
    const handler = new FindBodyCompositionAssessmentHandler(repository);

    const found = await handler.execute(
      new FindBodyCompositionAssessmentQuery({
        tenantId: TENANT_ID,
        assessmentId: ASSESSMENT_ID,
      }),
    );

    assert.equal(found.id, ASSESSMENT_ID);
    assert.equal(found.tenantId, TENANT_ID);
    assert.equal(found.bodyFatPercentage, '22.50');
    assert.equal(typeof found.bodyFatPercentage, 'string');
  });

  it('throws BodyCompositionAssessmentNotFoundError for wrong tenant', async () => {
    const repository = new InMemoryBodyCompositionAssessmentRepository();
    await seedAssessment(repository);
    const handler = new FindBodyCompositionAssessmentHandler(repository);

    await assert.rejects(
      () =>
        handler.execute(
          new FindBodyCompositionAssessmentQuery({
            tenantId: OTHER_TENANT_ID,
            assessmentId: ASSESSMENT_ID,
          }),
        ),
      BodyCompositionAssessmentNotFoundError,
    );
  });
});
