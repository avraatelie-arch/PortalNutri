import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { NutritionDiagnosis } from '../../domain/aggregates/nutrition-diagnosis.aggregate.js';
import { NutritionDiagnosisId } from '../../domain/value-objects/nutrition-diagnosis-id.js';
import { NutritionProblemCategory } from '../../domain/value-objects/nutrition-problem-category.js';
import { ProfessionalInterpretation } from '../../domain/value-objects/professional-interpretation.js';
import { InMemoryNutritionDiagnosisRepository } from '../../infrastructure/repositories/in-memory-nutrition-diagnosis.repository.js';
import { EditNutritionDiagnosisCommand } from './edit-nutrition-diagnosis.command.js';
import { EditNutritionDiagnosisHandler } from './edit-nutrition-diagnosis.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const DIAGNOSIS_ID = '550e8400-e29b-41d4-a716-446655440080';

describe('EditNutritionDiagnosisHandler', () => {
  it('edits draft diagnosis fields', async () => {
    const repository = new InMemoryNutritionDiagnosisRepository();
    const diagnosis = NutritionDiagnosis.create({
      id: NutritionDiagnosisId.create(DIAGNOSIS_ID),
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      now: NOW,
    });
    diagnosis.clearDomainEvents();
    await repository.save(diagnosis);

    const handler = new EditNutritionDiagnosisHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new EditNutritionDiagnosisCommand({
        tenantId: TENANT_ID,
        nutritionDiagnosisId: DIAGNOSIS_ID,
        problemCategory: 'DYSPHAGIA',
        professionalInterpretation: 'Swallowing difficulty observed during assessment.',
      }),
    );

    assert.equal(result.problemCategory, 'DYSPHAGIA');
    assert.equal(
      result.professionalInterpretation,
      'Swallowing difficulty observed during assessment.',
    );
    assert.equal(result.version, 2);
  });
});
