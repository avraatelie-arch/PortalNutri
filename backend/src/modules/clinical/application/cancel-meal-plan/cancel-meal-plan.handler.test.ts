import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { MealPlan } from '../../domain/aggregates/meal-plan.aggregate.js';
import { MealPlanId } from '../../domain/value-objects/meal-plan-id.js';
import { MealPlanStatusValue } from '../../domain/value-objects/meal-plan-status.js';
import { MealPlanTitle } from '../../domain/value-objects/meal-plan-title.js';
import { MealPlanType } from '../../domain/value-objects/meal-plan-type.js';
import { GeneralGuidelines } from '../../domain/value-objects/general-guidelines.js';
import { MealPlanClinicalNotes } from '../../domain/value-objects/meal-plan-clinical-notes.js';
import { TherapeuticStrategy } from '../../domain/value-objects/therapeutic-strategy.js';
import { InMemoryMealPlanRepository } from '../../infrastructure/repositories/in-memory-meal-plan.repository.js';
import { MealPlanCancellationReasonRequiredError } from '../errors/meal-plan-cancellation-reason-required.error.js';
import { CancelMealPlanCommand } from './cancel-meal-plan.command.js';
import { CancelMealPlanHandler } from './cancel-meal-plan.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const MEAL_PLAN_ID = '550e8400-e29b-41d4-a716-446655440090';

async function seedActiveMealPlan(repository: InMemoryMealPlanRepository) {
  const mealPlan = MealPlan.reconstitute({
    id: MealPlanId.create(MEAL_PLAN_ID),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: null,
    originAnamnesisId: null,
    planType: MealPlanType.parse('INITIAL'),
    status: MealPlanStatusValue.Active,
    version: 2,
    title: MealPlanTitle.create('Active meal plan'),
    therapeuticStrategy: TherapeuticStrategy.create('Strategy text'),
    generalGuidelines: GeneralGuidelines.empty(),
    clinicalNotes: MealPlanClinicalNotes.empty(),
    validFrom: null,
    validUntil: null,
    cancellationReason: null,
    activatedAt: NOW,
    cancelledAt: null,
    meals: [],
    createdAt: NOW,
    updatedAt: NOW,
  });
  await repository.save(mealPlan);
}

describe('CancelMealPlanHandler', () => {
  it('cancels draft meal plan without cancellation reason', async () => {
    const repository = new InMemoryMealPlanRepository();
    const draft = MealPlan.create({
      id: MealPlanId.create(MEAL_PLAN_ID),
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      now: NOW,
    });
    draft.clearDomainEvents();
    await repository.save(draft);

    const handler = new CancelMealPlanHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new CancelMealPlanCommand({
        tenantId: TENANT_ID,
        mealPlanId: MEAL_PLAN_ID,
      }),
    );

    assert.equal(result.status, MealPlanStatusValue.Cancelled);
    assert.equal(result.cancellationReason, null);
  });

  it('cancels active meal plan when cancellation reason is provided', async () => {
    const repository = new InMemoryMealPlanRepository();
    await seedActiveMealPlan(repository);
    const handler = new CancelMealPlanHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new CancelMealPlanCommand({
        tenantId: TENANT_ID,
        mealPlanId: MEAL_PLAN_ID,
        cancellationReason: 'Administrative correction',
      }),
    );

    assert.equal(result.status, MealPlanStatusValue.Cancelled);
    assert.equal(result.cancellationReason, 'Administrative correction');
  });

  it('throws when cancelling active meal plan without reason', async () => {
    const repository = new InMemoryMealPlanRepository();
    await seedActiveMealPlan(repository);
    const handler = new CancelMealPlanHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new CancelMealPlanCommand({
            tenantId: TENANT_ID,
            mealPlanId: MEAL_PLAN_ID,
          }),
        ),
      MealPlanCancellationReasonRequiredError,
    );
  });
});
