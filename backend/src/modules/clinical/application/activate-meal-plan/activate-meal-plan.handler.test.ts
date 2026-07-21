import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { MealPlan } from '../../domain/aggregates/meal-plan.aggregate.js';
import { MealPlanId } from '../../domain/value-objects/meal-plan-id.js';
import { MealPlanStatusValue } from '../../domain/value-objects/meal-plan-status.js';
import { GeneralGuidelines } from '../../domain/value-objects/general-guidelines.js';
import { MealPlanClinicalNotes } from '../../domain/value-objects/meal-plan-clinical-notes.js';
import { MealPlanTitle } from '../../domain/value-objects/meal-plan-title.js';
import { MealPlanType } from '../../domain/value-objects/meal-plan-type.js';
import { TherapeuticStrategy } from '../../domain/value-objects/therapeutic-strategy.js';
import { InMemoryMealPlanRepository } from '../../infrastructure/repositories/in-memory-meal-plan.repository.js';
import { MealPlanNotDraftError } from '../errors/meal-plan-not-draft.error.js';
import { MealPlanNotFoundError } from '../errors/meal-plan-not-found.error.js';
import { ActivateMealPlanCommand } from './activate-meal-plan.command.js';
import { ActivateMealPlanHandler } from './activate-meal-plan.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const OTHER_TENANT_ID = '550e8400-e29b-41d4-a716-446655440099';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const MEAL_PLAN_ID = '550e8400-e29b-41d4-a716-446655440090';

async function seedDraftMealPlan(repository: InMemoryMealPlanRepository) {
  const mealPlan = MealPlan.create({
    id: MealPlanId.create(MEAL_PLAN_ID),
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    planType: MealPlanType.parse('INITIAL'),
    title: MealPlanTitle.create('Weight management plan'),
    therapeuticStrategy: TherapeuticStrategy.create('Moderate caloric deficit.'),
    now: NOW,
  });
  mealPlan.clearDomainEvents();
  await repository.save(mealPlan);
  return mealPlan;
}

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
  return mealPlan;
}

describe('ActivateMealPlanHandler', () => {
  it('activates a draft meal plan with requirements met', async () => {
    const repository = new InMemoryMealPlanRepository();
    await seedDraftMealPlan(repository);
    const handler = new ActivateMealPlanHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new ActivateMealPlanCommand({
        tenantId: TENANT_ID,
        mealPlanId: MEAL_PLAN_ID,
      }),
    );

    assert.equal(result.status, MealPlanStatusValue.Active);
    assert.equal(result.activatedAt, LATER.toISOString());
    assert.equal(result.version, 2);
  });

  it('throws when meal plan is not draft', async () => {
    const repository = new InMemoryMealPlanRepository();
    await seedActiveMealPlan(repository);
    const handler = new ActivateMealPlanHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new ActivateMealPlanCommand({
            tenantId: TENANT_ID,
            mealPlanId: MEAL_PLAN_ID,
          }),
        ),
      MealPlanNotDraftError,
    );
  });

  it('throws MealPlanNotFoundError for wrong tenant', async () => {
    const repository = new InMemoryMealPlanRepository();
    await seedDraftMealPlan(repository);
    const handler = new ActivateMealPlanHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    await assert.rejects(
      () =>
        handler.execute(
          new ActivateMealPlanCommand({
            tenantId: OTHER_TENANT_ID,
            mealPlanId: MEAL_PLAN_ID,
          }),
        ),
      MealPlanNotFoundError,
    );
  });
});
