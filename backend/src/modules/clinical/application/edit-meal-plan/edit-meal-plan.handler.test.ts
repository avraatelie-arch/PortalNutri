import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { FixedClock } from '../../../../test-support/fixed-clock.js';
import { noopEventDispatcher } from '../../../../test-support/noop-event-dispatcher.js';
import { MealPlan } from '../../domain/aggregates/meal-plan.aggregate.js';
import { MealPlanId } from '../../domain/value-objects/meal-plan-id.js';
import { InMemoryMealPlanRepository } from '../../infrastructure/repositories/in-memory-meal-plan.repository.js';
import { EditMealPlanCommand } from './edit-meal-plan.command.js';
import { EditMealPlanHandler } from './edit-meal-plan.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const MEAL_PLAN_ID = '550e8400-e29b-41d4-a716-446655440090';

describe('EditMealPlanHandler', () => {
  it('edits draft meal plan fields', async () => {
    const repository = new InMemoryMealPlanRepository();
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

    const handler = new EditMealPlanHandler(
      repository,
      new FixedClock(LATER),
      noopEventDispatcher,
    );

    const result = await handler.execute(
      new EditMealPlanCommand({
        tenantId: TENANT_ID,
        mealPlanId: MEAL_PLAN_ID,
        title: 'Updated meal plan',
        planType: 'MAINTENANCE',
        therapeuticStrategy: 'Protein-focused maintenance strategy.',
        meals: [
          {
            sortOrder: 1,
            name: 'Lunch',
            content: 'Grilled chicken with salad.',
          },
        ],
      }),
    );

    assert.equal(result.title, 'Updated meal plan');
    assert.equal(result.planType, 'MAINTENANCE');
    assert.equal(result.therapeuticStrategy, 'Protein-focused maintenance strategy.');
    assert.equal(result.meals.length, 1);
    assert.equal(result.meals[0]?.name, 'Lunch');
    assert.equal(result.version, 2);
  });
});
