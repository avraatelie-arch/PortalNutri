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
import { FindMealPlansByPatientQuery } from './find-meal-plans-by-patient.query.js';
import { FindMealPlansByPatientHandler } from './find-meal-plans-by-patient.handler.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const EARLIER = new Date('2026-07-19T10:00:00.000Z');
const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';

describe('FindMealPlansByPatientHandler', () => {
  it('returns meal plans ordered by effective date descending', async () => {
    const repository = new InMemoryMealPlanRepository();

    const older = MealPlan.create({
      id: MealPlanId.create('550e8400-e29b-41d4-a716-446655440091'),
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      now: EARLIER,
    });
    older.clearDomainEvents();
    await repository.save(older);

    const newer = MealPlan.reconstitute({
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
      createdAt: EARLIER,
      updatedAt: NOW,
    });
    await repository.save(newer);

    const results = await new FindMealPlansByPatientHandler(repository).execute(
      new FindMealPlansByPatientQuery({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
      }),
    );

    assert.equal(results.length, 2);
    assert.equal(results[0]?.id, newer.getId().toString());
    assert.equal(results[1]?.id, older.getId().toString());
  });

  it('filters by status when provided', async () => {
    const repository = new InMemoryMealPlanRepository();
    const draft = MealPlan.create({
      tenantId: TENANT_ID,
      patientId: PATIENT_ID,
      createdByNutritionistId: CREATED_BY_ID,
      responsibleNutritionistId: RESPONSIBLE_ID,
      now: NOW,
    });
    await repository.save(draft);

    const results = await new FindMealPlansByPatientHandler(repository).execute(
      new FindMealPlansByPatientQuery({
        tenantId: TENANT_ID,
        patientId: PATIENT_ID,
        status: MealPlanStatusValue.Draft,
      }),
    );

    assert.equal(results.length, 1);
    assert.equal(results[0]?.status, MealPlanStatusValue.Draft);
  });
});
