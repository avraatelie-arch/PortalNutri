import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MealPlan } from '../../domain/aggregates/meal-plan.aggregate.js';
import { MealPlanId } from '../../domain/value-objects/meal-plan-id.js';
import { MealPlanStatusValue } from '../../domain/value-objects/meal-plan-status.js';
import { MealPlanTitle } from '../../domain/value-objects/meal-plan-title.js';
import { MealPlanType } from '../../domain/value-objects/meal-plan-type.js';
import { GeneralGuidelines } from '../../domain/value-objects/general-guidelines.js';
import { MealPlanClinicalNotes } from '../../domain/value-objects/meal-plan-clinical-notes.js';
import { TherapeuticStrategy } from '../../domain/value-objects/therapeutic-strategy.js';
import { InMemoryMealPlanRepository } from '../../infrastructure/repositories/in-memory-meal-plan.repository.js';
import { FindActiveMealPlansByPatientQuery } from './find-active-meal-plans-by-patient.query.js';
import { FindActiveMealPlansByPatientHandler } from './find-active-meal-plans-by-patient.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';

describe('FindActiveMealPlansByPatientHandler', () => {
  it('returns only active meal plans', async () => {
    const repository = new InMemoryMealPlanRepository();

    await repository.save(
      MealPlan.create({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
        createdByNutritionistId: CREATED_BY_ID,
        responsibleNutritionistId: RESPONSIBLE_ID,
        now: NOW,
      }),
    );

    const active = MealPlan.reconstitute({
      id: MealPlanId.create('550e8400-e29b-41d4-a716-446655440092'),
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      originClinicalEncounterId: null,
      originAnamnesisId: null,
      planType: MealPlanType.parse('INITIAL'),
      status: MealPlanStatusValue.Active,
      version: 2,
      title: MealPlanTitle.create('Active plan'),
      therapeuticStrategy: TherapeuticStrategy.create('Strategy'),
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
    await repository.save(active);

    const results = await new FindActiveMealPlansByPatientHandler(repository).execute(
      new FindActiveMealPlansByPatientQuery({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
      }),
    );

    assert.equal(results.length, 1);
    assert.equal(results[0]?.status, MealPlanStatusValue.Active);
  });
});
