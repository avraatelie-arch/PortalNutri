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
import { FindAnthropometricAssessmentsByPatientHandler } from './find-anthropometric-assessments-by-patient.handler.js';
import { FindAnthropometricAssessmentsByPatientQuery } from './find-anthropometric-assessments-by-patient.query.js';

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';

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
      anamnesisId: '550e8400-e29b-41d4-a716-446655440060',
      clinicalEncounterId: '550e8400-e29b-41d4-a716-446655440050',
      patientId: PATIENT_ID,
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

describe('FindAnthropometricAssessmentsByPatientHandler', () => {
  it('returns empty collection when no assessments exist', async () => {
    const handler = new FindAnthropometricAssessmentsByPatientHandler(
      new InMemoryAnthropometricAssessmentRepository(),
    );

    const results = await handler.execute(
      new FindAnthropometricAssessmentsByPatientQuery({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
      }),
    );

    assert.deepEqual(results, []);
  });

  it('filters by optional measuredAt date range', async () => {
    const repository = new InMemoryAnthropometricAssessmentRepository();
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

    const handler = new FindAnthropometricAssessmentsByPatientHandler(repository);
    const results = await handler.execute(
      new FindAnthropometricAssessmentsByPatientQuery({
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
