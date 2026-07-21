import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MealPlan } from '../../domain/aggregates/meal-plan.aggregate.js';
import { MealPlanId } from '../../domain/value-objects/meal-plan-id.js';
import { InMemoryMealPlanRepository } from '../../infrastructure/repositories/in-memory-meal-plan.repository.js';
import { MealPlanNotFoundError } from '../errors/meal-plan-not-found.error.js';
import { FindMealPlanQuery } from './find-meal-plan.query.js';
import { FindMealPlanHandler } from './find-meal-plan.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const MEAL_PLAN_ID = '550e8400-e29b-41d4-a716-446655440090';

describe('FindMealPlanHandler', () => {
  it('finds meal plan by tenant and id', async () => {
    const repository = new InMemoryMealPlanRepository();
    const mealPlan = MealPlan.create({
      id: MealPlanId.create(MEAL_PLAN_ID),
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      now: NOW,
    });
    await repository.save(mealPlan);

    const result = await new FindMealPlanHandler(repository).execute(
      new FindMealPlanQuery({
        tenantId: TENANT_ID,
        mealPlanId: MEAL_PLAN_ID,
      }),
    );

    assert.equal(result.id, MEAL_PLAN_ID);
  });

  it('throws when meal plan is not found', async () => {
    await assert.rejects(
      () =>
        new FindMealPlanHandler(new InMemoryMealPlanRepository()).execute(
          new FindMealPlanQuery({
            tenantId: TENANT_ID,
            mealPlanId: MEAL_PLAN_ID,
          }),
        ),
      MealPlanNotFoundError,
    );
  });
});
