import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { MealPlan } from '../../domain/aggregates/meal-plan.aggregate.js';
import { MealPlanId } from '../../domain/value-objects/meal-plan-id.js';
import { InMemoryNutritionistDirectory } from '../../infrastructure/adapters/in-memory-nutritionist-directory.js';
import { InMemoryMealPlanRepository } from '../../infrastructure/repositories/in-memory-meal-plan.repository.js';
import { ChangeMealPlanResponsibleNutritionistCommand } from './change-meal-plan-responsible-nutritionist.command.js';
import { ChangeMealPlanResponsibleNutritionistHandler } from './change-meal-plan-responsible-nutritionist.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const NEW_RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440032';
const MEAL_PLAN_ID = '550e8400-e29b-41d4-a716-446655440090';

describe('ChangeMealPlanResponsibleNutritionistHandler', () => {
  it('changes responsible nutritionist', async () => {
    const repository = new InMemoryMealPlanRepository();
    const nutritionistDirectory = new InMemoryNutritionistDirectory();
    nutritionistDirectory.seed({ id: NEW_RESPONSIBLE_ID, tenantId: TENANT_ID, status: 'ACTIVE' });

    const mealPlan = MealPlan.create({
      id: MealPlanId.create(MEAL_PLAN_ID),
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      now: NOW,
    });
    mealPlan.clearDomainEvents();
    await repository.save(mealPlan);

    const handler = new ChangeMealPlanResponsibleNutritionistHandler(
      repository,
      nutritionistDirectory,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new ChangeMealPlanResponsibleNutritionistCommand({
        tenantId: TENANT_ID,
        mealPlanId: MEAL_PLAN_ID,
        responsibleNutritionistId: NEW_RESPONSIBLE_ID,
      }),
    );

    assert.equal(result.responsibleNutritionistId, NEW_RESPONSIBLE_ID);
    assert.equal(result.version, 2);
  });
});
