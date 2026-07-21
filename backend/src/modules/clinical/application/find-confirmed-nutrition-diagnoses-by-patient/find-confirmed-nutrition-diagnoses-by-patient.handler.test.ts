import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { NutritionDiagnosis } from '../../domain/aggregates/nutrition-diagnosis.aggregate.js';
import { NutritionDiagnosisId } from '../../domain/value-objects/nutrition-diagnosis-id.js';
import { NutritionDiagnosisStatusValue } from '../../domain/value-objects/nutrition-diagnosis-status.js';
import { NutritionProblemCategory } from '../../domain/value-objects/nutrition-problem-category.js';
import { ProfessionalInterpretation } from '../../domain/value-objects/professional-interpretation.js';
import { InMemoryNutritionDiagnosisRepository } from '../../infrastructure/repositories/in-memory-nutrition-diagnosis.repository.js';
import { FindConfirmedNutritionDiagnosesByPatientQuery } from './find-confirmed-nutrition-diagnoses-by-patient.query.js';
import { FindConfirmedNutritionDiagnosesByPatientHandler } from './find-confirmed-nutrition-diagnoses-by-patient.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';

describe('FindConfirmedNutritionDiagnosesByPatientHandler', () => {
  it('returns only confirmed diagnoses', async () => {
    const repository = new InMemoryNutritionDiagnosisRepository();

    await repository.save(
      NutritionDiagnosis.create({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
        createdByNutritionistId: CREATED_BY_ID,
        responsibleNutritionistId: RESPONSIBLE_ID,
        now: NOW,
      }),
    );

    const confirmed = NutritionDiagnosis.reconstitute({
      id: NutritionDiagnosisId.create('550e8400-e29b-41d4-a716-446655440082'),
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      originClinicalEncounterId: null,
      originAnamnesisId: null,
      problemCategory: NutritionProblemCategory.parse('OTHER'),
      status: NutritionDiagnosisStatusValue.Confirmed,
      version: 2,
      professionalInterpretation: ProfessionalInterpretation.create('Confirmed'),
      cancellationReason: null,
      confirmedAt: NOW,
      cancelledAt: null,
      createdAt: NOW,
      updatedAt: NOW,
    });
    await repository.save(confirmed);

    const results = await new FindConfirmedNutritionDiagnosesByPatientHandler(
      repository,
    ).execute(
      new FindConfirmedNutritionDiagnosesByPatientQuery({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
      }),
    );

    assert.equal(results.length, 1);
    assert.equal(results[0]?.status, NutritionDiagnosisStatusValue.Confirmed);
  });
});
