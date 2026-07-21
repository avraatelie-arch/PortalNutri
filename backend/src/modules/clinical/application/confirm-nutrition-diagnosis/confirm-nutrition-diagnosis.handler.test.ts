import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { NutritionDiagnosis } from '../../domain/aggregates/nutrition-diagnosis.aggregate.js';
import { NutritionDiagnosisId } from '../../domain/value-objects/nutrition-diagnosis-id.js';
import { NutritionDiagnosisStatusValue } from '../../domain/value-objects/nutrition-diagnosis-status.js';
import { NutritionProblemCategory } from '../../domain/value-objects/nutrition-problem-category.js';
import { ProfessionalInterpretation } from '../../domain/value-objects/professional-interpretation.js';
import { InMemoryNutritionDiagnosisRepository } from '../../infrastructure/repositories/in-memory-nutrition-diagnosis.repository.js';
import { NutritionDiagnosisNotDraftError } from '../errors/nutrition-diagnosis-not-draft.error.js';
import { NutritionDiagnosisNotFoundError } from '../errors/nutrition-diagnosis-not-found.error.js';
import { ConfirmNutritionDiagnosisCommand } from './confirm-nutrition-diagnosis.command.js';
import { ConfirmNutritionDiagnosisHandler } from './confirm-nutrition-diagnosis.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const DIAGNOSIS_ID = '550e8400-e29b-41d4-a716-446655440080';

async function seedDraftDiagnosis(repository: InMemoryNutritionDiagnosisRepository) {
  const diagnosis = NutritionDiagnosis.create({
    id: NutritionDiagnosisId.create(DIAGNOSIS_ID),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    problemCategory: NutritionProblemCategory.parse('ENERGY_BALANCE'),
    professionalInterpretation: ProfessionalInterpretation.create(
      'Excessive energy intake relative to expenditure.',
    ),
    now: NOW,
  });
  diagnosis.clearDomainEvents();
  await repository.save(diagnosis);
  return diagnosis;
}

async function seedConfirmedDiagnosis(repository: InMemoryNutritionDiagnosisRepository) {
  const diagnosis = NutritionDiagnosis.reconstitute({
    id: NutritionDiagnosisId.create(DIAGNOSIS_ID),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: null,
    originAnamnesisId: null,
    problemCategory: NutritionProblemCategory.parse('ENERGY_BALANCE'),
    status: NutritionDiagnosisStatusValue.Confirmed,
    version: 2,
    professionalInterpretation: ProfessionalInterpretation.create(
      'Excessive energy intake relative to expenditure.',
    ),
    cancellationReason: null,
    confirmedAt: NOW,
    cancelledAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  });
  await repository.save(diagnosis);
  return diagnosis;
}

describe('ConfirmNutritionDiagnosisHandler', () => {
  it('confirms a draft diagnosis with interpretation', async () => {
    const repository = new InMemoryNutritionDiagnosisRepository();
    await seedDraftDiagnosis(repository);
    const handler = new ConfirmNutritionDiagnosisHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new ConfirmNutritionDiagnosisCommand({
        tenantId: TENANT_ID,
        nutritionDiagnosisId: DIAGNOSIS_ID,
      }),
    );

    assert.equal(result.status, NutritionDiagnosisStatusValue.Confirmed);
    assert.equal(result.confirmedAt, LATER.toISOString());
    assert.equal(result.version, 2);
  });

  it('throws when diagnosis is not draft', async () => {
    const repository = new InMemoryNutritionDiagnosisRepository();
    await seedConfirmedDiagnosis(repository);
    const handler = new ConfirmNutritionDiagnosisHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new ConfirmNutritionDiagnosisCommand({
            tenantId: TENANT_ID,
            nutritionDiagnosisId: DIAGNOSIS_ID,
          }),
        ),
      NutritionDiagnosisNotDraftError,
    );
  });

  it('throws NutritionDiagnosisNotFoundError for wrong tenant', async () => {
    const repository = new InMemoryNutritionDiagnosisRepository();
    await seedDraftDiagnosis(repository);
    const handler = new ConfirmNutritionDiagnosisHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new ConfirmNutritionDiagnosisCommand({
            tenantId: OTHER_TENANT_ID,
            nutritionDiagnosisId: DIAGNOSIS_ID,
          }),
        ),
      NutritionDiagnosisNotFoundError,
    );
  });
});
