import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { NutritionDiagnosis } from '../../domain/aggregates/nutrition-diagnosis.aggregate.js';
import { NutritionDiagnosisId } from '../../domain/value-objects/nutrition-diagnosis-id.js';
import { InMemoryNutritionDiagnosisRepository } from '../../infrastructure/repositories/in-memory-nutrition-diagnosis.repository.js';
import { NutritionDiagnosisNotFoundError } from '../errors/nutrition-diagnosis-not-found.error.js';
import { FindNutritionDiagnosisQuery } from './find-nutrition-diagnosis.query.js';
import { FindNutritionDiagnosisHandler } from './find-nutrition-diagnosis.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const DIAGNOSIS_ID = '550e8400-e29b-41d4-a716-446655440080';

describe('FindNutritionDiagnosisHandler', () => {
  it('finds diagnosis by tenant and id', async () => {
    const repository = new InMemoryNutritionDiagnosisRepository();
    const diagnosis = NutritionDiagnosis.create({
      id: NutritionDiagnosisId.create(DIAGNOSIS_ID),
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      now: NOW,
    });
    await repository.save(diagnosis);

    const result = await new FindNutritionDiagnosisHandler(repository).execute(
      new FindNutritionDiagnosisQuery({
        tenantId: TENANT_ID,
        nutritionDiagnosisId: DIAGNOSIS_ID,
      }),
    );

    assert.equal(result.id, DIAGNOSIS_ID);
  });

  it('throws when diagnosis is not found', async () => {
    await assert.rejects(
      () =>
        new FindNutritionDiagnosisHandler(new InMemoryNutritionDiagnosisRepository()).execute(
          new FindNutritionDiagnosisQuery({
            tenantId: TENANT_ID,
            nutritionDiagnosisId: DIAGNOSIS_ID,
          }),
        ),
      NutritionDiagnosisNotFoundError,
    );
  });
});
