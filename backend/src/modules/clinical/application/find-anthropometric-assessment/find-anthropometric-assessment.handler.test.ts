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
import { AnthropometricAssessmentNotFoundError } from '../errors/anthropometric-assessment-not-found.error.js';
import { FindAnthropometricAssessmentHandler } from './find-anthropometric-assessment.handler.js';
import { FindAnthropometricAssessmentQuery } from './find-anthropometric-assessment.query.js';

const NOW = new Date('2026-07-17T10:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const ASSESSMENT_ID = '550e8400-e29b-41d4-a716-446655440080';

async function seedAssessment(
  repository: InMemoryAnthropometricAssessmentRepository,
  overrides?: { tenantId?: string },
) {
  const calculator = new BodyMassIndexCalculator();
  const weight = BodyWeight.create('72.50');
  const height = BodyHeight.create('170.00');
  const assessment = AnthropometricAssessment.create(
    {
      id: AnthropometricAssessmentId.create(ASSESSMENT_ID),
      tenantId: overrides?.tenantId ?? TENANT_ID,
      anamnesisId: '550e8400-e29b-41d4-a716-446655440060',
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
      measuredAt: NOW,
    },
    NOW,
  );
  assessment.clearDomainEvents();
  await repository.save(assessment);
  return assessment;
}

describe('FindAnthropometricAssessmentHandler', () => {
  it('finds assessment scoped to tenant with decimal strings', async () => {
    const repository = new InMemoryAnthropometricAssessmentRepository();
    await seedAssessment(repository);
    const handler = new FindAnthropometricAssessmentHandler(repository);

    const found = await handler.execute(
      new FindAnthropometricAssessmentQuery({
        tenantId: TENANT_ID,
        assessmentId: ASSESSMENT_ID,
      }),
    );

    assert.equal(found.id, ASSESSMENT_ID);
    assert.equal(found.tenantId, TENANT_ID);
    assert.equal(found.weightKg, '72.50');
    assert.equal(found.heightCm, '170.00');
    assert.equal(found.bodyMassIndex, '25.09');
    assert.equal(typeof found.weightKg, 'string');
  });

  it('throws AnthropometricAssessmentNotFoundError for wrong tenant', async () => {
    const repository = new InMemoryAnthropometricAssessmentRepository();
    await seedAssessment(repository);
    const handler = new FindAnthropometricAssessmentHandler(repository);

    await assert.rejects(
      () =>
        handler.execute(
          new FindAnthropometricAssessmentQuery({
            tenantId: OTHER_TENANT_ID,
            assessmentId: ASSESSMENT_ID,
          }),
        ),
      AnthropometricAssessmentNotFoundError,
    );
  });
});
