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
import { NutritionDiagnosisCancellationReasonRequiredError } from '../errors/nutrition-diagnosis-cancellation-reason-required.error.js';
import { CancelNutritionDiagnosisCommand } from './cancel-nutrition-diagnosis.command.js';
import { CancelNutritionDiagnosisHandler } from './cancel-nutrition-diagnosis.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const DIAGNOSIS_ID = '550e8400-e29b-41d4-a716-446655440080';

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
    professionalInterpretation: ProfessionalInterpretation.create('Confirmed interpretation'),
    cancellationReason: null,
    confirmedAt: NOW,
    cancelledAt: null,
    createdAt: NOW,
    updatedAt: NOW,
  });
  await repository.save(diagnosis);
}

describe('CancelNutritionDiagnosisHandler', () => {
  it('cancels draft diagnosis without cancellation reason', async () => {
    const repository = new InMemoryNutritionDiagnosisRepository();
    const draft = NutritionDiagnosis.create({
      id: NutritionDiagnosisId.create(DIAGNOSIS_ID),
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      now: NOW,
    });
    draft.clearDomainEvents();
    await repository.save(draft);

    const handler = new CancelNutritionDiagnosisHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new CancelNutritionDiagnosisCommand({
        tenantId: TENANT_ID,
        nutritionDiagnosisId: DIAGNOSIS_ID,
      }),
    );

    assert.equal(result.status, NutritionDiagnosisStatusValue.Cancelled);
    assert.equal(result.cancellationReason, null);
  });

  it('cancels confirmed diagnosis when cancellation reason is provided', async () => {
    const repository = new InMemoryNutritionDiagnosisRepository();
    await seedConfirmedDiagnosis(repository);
    const handler = new CancelNutritionDiagnosisHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new CancelNutritionDiagnosisCommand({
        tenantId: TENANT_ID,
        nutritionDiagnosisId: DIAGNOSIS_ID,
        cancellationReason: 'Administrative correction',
      }),
    );

    assert.equal(result.status, NutritionDiagnosisStatusValue.Cancelled);
    assert.equal(result.cancellationReason, 'Administrative correction');
  });

  it('throws when cancelling confirmed diagnosis without reason', async () => {
    const repository = new InMemoryNutritionDiagnosisRepository();
    await seedConfirmedDiagnosis(repository);
    const handler = new CancelNutritionDiagnosisHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new CancelNutritionDiagnosisCommand({
            tenantId: TENANT_ID,
            nutritionDiagnosisId: DIAGNOSIS_ID,
          }),
        ),
      NutritionDiagnosisCancellationReasonRequiredError,
    );
  });
});
