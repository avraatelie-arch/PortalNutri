import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MealPlanMeal } from '../entities/meal-plan-meal.js';
import { MealPlanActivationRequirementsNotMetDomainError } from '../errors/meal-plan-activation-requirements-not-met.domain-error.js';
import { MealPlanCancellationReasonRequiredDomainError } from '../errors/meal-plan-cancellation-reason-required.domain-error.js';
import { MealPlanInvalidTransitionDomainError } from '../errors/meal-plan-invalid-transition.domain-error.js';
import { MEAL_PLAN_MAX_MEALS, MealPlanMaxMealsExceededDomainError } from '../errors/meal-plan-max-meals-exceeded.domain-error.js';
import { MealPlanTerminalDomainError } from '../errors/meal-plan-terminal.domain-error.js';
import {
  MealPlanActivated,
  MealPlanCancelled,
  MealPlanCreated,
  MealPlanResponsibleNutritionistChanged,
  MealPlanUpdated,
} from '../events/meal-plan-events.js';
import { GeneralGuidelines } from '../value-objects/general-guidelines.js';
import { MealContent } from '../value-objects/meal-content.js';
import { MealName } from '../value-objects/meal-name.js';
import { MealPlanCancellationReason } from '../value-objects/meal-plan-cancellation-reason.js';
import { MealPlanClinicalNotes } from '../value-objects/meal-plan-clinical-notes.js';
import { MealPlanId } from '../value-objects/meal-plan-id.js';
import { MealPlanStatusValue } from '../value-objects/meal-plan-status.js';
import { MealPlanTitle } from '../value-objects/meal-plan-title.js';
import { MealPlanType } from '../value-objects/meal-plan-type.js';
import { MealScheduledTime } from '../value-objects/meal-scheduled-time.js';
import { TherapeuticStrategy } from '../value-objects/therapeutic-strategy.js';
import { MealPlan } from './meal-plan.aggregate.js';

const NOW = new Date('2026-07-20T10:00:00.000Z');
const LATER = new Date('2026-07-20T11:00:00.000Z');
const NEXT_DAY = new Date('2026-07-21T10:00:00.000Z');

const TENANT_ID = '550e8400-e29b-41d4-a716-446655440001';
const PATIENT_ID = '550e8400-e29b-41d4-a716-446655440020';
const CREATED_BY_ID = '550e8400-e29b-41d4-a716-446655440030';
const RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440031';
const NEW_RESPONSIBLE_ID = '550e8400-e29b-41d4-a716-446655440032';
const ENCOUNTER_ID = '550e8400-e29b-41d4-a716-446655440050';
const ANAMNESIS_ID = '550e8400-e29b-41d4-a716-446655440060';
const MEAL_PLAN_ID = MealPlanId.create('550e8400-e29b-41d4-a716-446655440090');

const PLAN_TYPE = MealPlanType.parse('INITIAL');

function createBreakfastMeal() {
  return MealPlanMeal.create({
    sortOrder: 1,
    name: MealName.create('Breakfast'),
    scheduledTime: MealScheduledTime.create('07:30'),
    content: MealContent.create('Oats with fruit and yogurt.'),
  });
}

function createDraftMealPlan(params?: {
  title?: MealPlanTitle;
  planType?: MealPlanType | null;
  therapeuticStrategy?: TherapeuticStrategy;
  meals?: MealPlanMeal[];
}) {
  return MealPlan.create({
    id: MEAL_PLAN_ID,
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: ENCOUNTER_ID,
    originAnamnesisId: ANAMNESIS_ID,
    planType: params?.planType,
    title: params?.title,
    therapeuticStrategy: params?.therapeuticStrategy,
    meals: params?.meals,
    now: NOW,
  });
}

function activateMealPlan(mealPlan: MealPlan, at: Date = LATER): void {
  mealPlan.clearDomainEvents();

  if (mealPlan.getTitle().isEmpty()) {
    mealPlan.edit({ title: MealPlanTitle.create('Weight management plan') }, at);
    mealPlan.clearDomainEvents();
  }

  if (
    mealPlan.getTherapeuticStrategy().isEmpty()
    && !mealPlan.getMeals().some((meal) => !meal.getContent().isEmpty())
  ) {
    mealPlan.edit(
      {
        therapeuticStrategy: TherapeuticStrategy.create(
          'Moderate caloric deficit with protein prioritization.',
        ),
      },
      at,
    );
    mealPlan.clearDomainEvents();
  }

  mealPlan.activate(at);
}

function reconstituteMealPlan(params: {
  status: (typeof MealPlanStatusValue)[keyof typeof MealPlanStatusValue];
  version?: number;
  title?: MealPlanTitle;
  therapeuticStrategy?: TherapeuticStrategy;
  meals?: MealPlanMeal[];
  activatedAt?: Date | null;
  cancelledAt?: Date | null;
  cancellationReason?: MealPlanCancellationReason | null;
}) {
  return MealPlan.reconstitute({
    id: MEAL_PLAN_ID,
    tenantId: TENANT_ID,
    patientId: PATIENT_ID,
    createdByNutritionistId: CREATED_BY_ID,
    responsibleNutritionistId: RESPONSIBLE_ID,
    originClinicalEncounterId: ENCOUNTER_ID,
    originAnamnesisId: ANAMNESIS_ID,
    planType: PLAN_TYPE,
    status: params.status,
    version: params.version ?? 1,
    title: params.title ?? MealPlanTitle.create('Existing meal plan'),
    therapeuticStrategy:
      params.therapeuticStrategy
      ?? TherapeuticStrategy.create('Existing therapeutic strategy'),
    generalGuidelines: GeneralGuidelines.empty(),
    clinicalNotes: MealPlanClinicalNotes.empty(),
    validFrom: null,
    validUntil: null,
    cancellationReason: params.cancellationReason ?? null,
    activatedAt: params.activatedAt ?? null,
    cancelledAt: params.cancelledAt ?? null,
    meals: params.meals ?? [createBreakfastMeal()],
    createdAt: NOW,
    updatedAt: NOW,
  });
}

function assertEventHasNoClinicalText(event: unknown): void {
  const serialized = JSON.stringify(event);

  assert.doesNotMatch(serialized, /Moderate caloric deficit/i);
  assert.doesNotMatch(serialized, /Existing therapeutic strategy/i);
  assert.doesNotMatch(serialized, /Oats with fruit/i);
  assert.doesNotMatch(serialized, /Administrative correction/i);
}

describe('MealPlan aggregate', () => {
  it('creates in DRAFT with empty title, null planType and version 1', () => {
    const mealPlan = createDraftMealPlan();
    const event = mealPlan.domainEvents[0] as MealPlanCreated;

    assert.equal(mealPlan.getStatus(), MealPlanStatusValue.Draft);
    assert.equal(mealPlan.getVersion(), 1);
    assert.equal(mealPlan.getTitle().isEmpty(), true);
    assert.equal(mealPlan.getPlanType(), null);
    assert.equal(mealPlan.getOriginClinicalEncounterId(), ENCOUNTER_ID);
    assert.equal(mealPlan.getOriginAnamnesisId(), ANAMNESIS_ID);
    assert.equal(event.eventName, 'MealPlanCreated');
    assert.equal(event.aggregateId, MEAL_PLAN_ID.toString());
    assert.equal(event.planType, null);
    assertEventHasNoClinicalText(event);
  });

  it('allows empty title in DRAFT', () => {
    const mealPlan = createDraftMealPlan({
      title: MealPlanTitle.create(''),
    });

    assert.equal(mealPlan.getTitle().isEmpty(), true);
  });

  it('activates from DRAFT with title and therapeutic strategy', () => {
    const mealPlan = createDraftMealPlan({
      title: MealPlanTitle.create('Weight management plan'),
      planType: PLAN_TYPE,
      therapeuticStrategy: TherapeuticStrategy.create(
        'Moderate caloric deficit with protein prioritization.',
      ),
    });
    mealPlan.clearDomainEvents();

    mealPlan.activate(LATER);

    assert.equal(mealPlan.getStatus(), MealPlanStatusValue.Active);
    assert.equal(mealPlan.getVersion(), 2);
    assert.deepEqual(mealPlan.getActivatedAt(), LATER);

    const event = mealPlan.domainEvents[0] as MealPlanActivated;
    assert.equal(event.eventName, 'MealPlanActivated');
    assert.equal(event.version, 2);
    assertEventHasNoClinicalText(event);
  });

  it('activates from DRAFT with title and meal content', () => {
    const mealPlan = createDraftMealPlan({
      title: MealPlanTitle.create('High protein plan'),
      meals: [createBreakfastMeal()],
    });
    mealPlan.clearDomainEvents();

    mealPlan.activate(LATER);

    assert.equal(mealPlan.getStatus(), MealPlanStatusValue.Active);
  });

  it('rejects activation without title', () => {
    const mealPlan = createDraftMealPlan({
      therapeuticStrategy: TherapeuticStrategy.create('Strategy text'),
    });

    assert.throws(
      () => mealPlan.activate(LATER),
      MealPlanActivationRequirementsNotMetDomainError,
    );
  });

  it('rejects activation without therapeutic strategy or meal content', () => {
    const mealPlan = createDraftMealPlan({
      title: MealPlanTitle.create('Title only plan'),
    });

    assert.throws(
      () => mealPlan.activate(LATER),
      MealPlanActivationRequirementsNotMetDomainError,
    );
  });

  it('cancels from DRAFT without cancellation reason', () => {
    const mealPlan = createDraftMealPlan();
    mealPlan.clearDomainEvents();

    mealPlan.cancel({}, LATER);

    assert.equal(mealPlan.getStatus(), MealPlanStatusValue.Cancelled);
    assert.equal(mealPlan.getCancellationReason(), null);
    assert.deepEqual(mealPlan.getCancelledAt(), LATER);
  });

  it('cancels from ACTIVE when cancellation reason is provided', () => {
    const mealPlan = createDraftMealPlan({
      title: MealPlanTitle.create('Active plan'),
      therapeuticStrategy: TherapeuticStrategy.create('Strategy'),
    });
    activateMealPlan(mealPlan);
    mealPlan.clearDomainEvents();

    mealPlan.cancel(
      {
        cancellationReason: MealPlanCancellationReason.create('Administrative correction'),
      },
      LATER,
    );

    assert.equal(mealPlan.getStatus(), MealPlanStatusValue.Cancelled);
    assert.equal(
      mealPlan.getCancellationReason()?.toPersistence(),
      'Administrative correction',
    );
  });

  it('rejects cancel ACTIVE without cancellation reason', () => {
    const mealPlan = createDraftMealPlan({
      title: MealPlanTitle.create('Active plan'),
      therapeuticStrategy: TherapeuticStrategy.create('Strategy'),
    });
    activateMealPlan(mealPlan);

    assert.throws(
      () => mealPlan.cancel({}, LATER),
      MealPlanCancellationReasonRequiredDomainError,
    );
  });

  it('rejects invalid lifecycle transitions', () => {
    const mealPlan = createDraftMealPlan({
      title: MealPlanTitle.create('Active plan'),
      therapeuticStrategy: TherapeuticStrategy.create('Strategy'),
    });

    activateMealPlan(mealPlan);

    assert.throws(
      () => mealPlan.activate(LATER),
      MealPlanInvalidTransitionDomainError,
    );
    assert.throws(
      () => mealPlan.edit({ title: MealPlanTitle.create('Updated title') }, LATER),
      MealPlanInvalidTransitionDomainError,
    );
  });

  it('rejects mutations in terminal CANCELLED state', () => {
    const cancelled = reconstituteMealPlan({
      status: MealPlanStatusValue.Cancelled,
      cancelledAt: NEXT_DAY,
    });

    assert.throws(
      () =>
        cancelled.edit(
          { title: MealPlanTitle.create('Updated title') },
          NEXT_DAY,
        ),
      MealPlanTerminalDomainError,
    );
    assert.throws(
      () => cancelled.changeResponsibleNutritionist(NEW_RESPONSIBLE_ID, NEXT_DAY),
      MealPlanTerminalDomainError,
    );
    assert.throws(() => cancelled.cancel({}, NEXT_DAY), MealPlanTerminalDomainError);
  });

  it('edit returns changed field names and emits MealPlanUpdated without text', () => {
    const mealPlan = createDraftMealPlan({
      planType: MealPlanType.parse('OTHER'),
    });
    mealPlan.clearDomainEvents();

    const changedFields = mealPlan.edit(
      {
        planType: PLAN_TYPE,
        title: MealPlanTitle.create('Updated meal plan title'),
        therapeuticStrategy: TherapeuticStrategy.create('Updated strategy details'),
        generalGuidelines: GeneralGuidelines.create('Drink water regularly.'),
        clinicalNotes: MealPlanClinicalNotes.create('Monitor weekly weight.'),
        validFrom: new Date('2026-07-22T00:00:00.000Z'),
        meals: [createBreakfastMeal()],
      },
      LATER,
    );

    assert.deepEqual(changedFields, [
      'title',
      'planType',
      'therapeuticStrategy',
      'generalGuidelines',
      'clinicalNotes',
      'validFrom',
      'meals',
    ]);
    assert.equal(mealPlan.getVersion(), 2);

    const event = mealPlan.domainEvents[0] as MealPlanUpdated;
    assert.equal(event.eventName, 'MealPlanUpdated');
    assertEventHasNoClinicalText(event);
  });

  it('edit is idempotent when values are unchanged', () => {
    const title = MealPlanTitle.create('Stable title');
    const strategy = TherapeuticStrategy.create('Stable strategy');
    const mealPlan = createDraftMealPlan({
      title,
      planType: PLAN_TYPE,
      therapeuticStrategy: strategy,
    });
    mealPlan.clearDomainEvents();

    const changedFields = mealPlan.edit(
      {
        title,
        planType: PLAN_TYPE,
        therapeuticStrategy: strategy,
      },
      LATER,
    );

    assert.deepEqual(changedFields, []);
    assert.equal(mealPlan.getVersion(), 1);
    assert.equal(mealPlan.domainEvents.length, 0);
  });

  it('changeResponsibleNutritionist updates owner and emits event', () => {
    const mealPlan = createDraftMealPlan();
    mealPlan.clearDomainEvents();

    const changed = mealPlan.changeResponsibleNutritionist(NEW_RESPONSIBLE_ID, LATER);

    assert.equal(changed, true);
    assert.equal(mealPlan.getResponsibleNutritionistId(), NEW_RESPONSIBLE_ID);
    assert.equal(mealPlan.getVersion(), 2);

    const event = mealPlan.domainEvents[0] as MealPlanResponsibleNutritionistChanged;
    assert.equal(event.eventName, 'MealPlanResponsibleNutritionistChanged');
    assert.equal(event.responsibleNutritionistId, NEW_RESPONSIBLE_ID);
    assertEventHasNoClinicalText(event);
  });

  it('changeResponsibleNutritionist is idempotent when unchanged', () => {
    const mealPlan = createDraftMealPlan();
    mealPlan.clearDomainEvents();

    const changed = mealPlan.changeResponsibleNutritionist(RESPONSIBLE_ID, LATER);

    assert.equal(changed, false);
    assert.equal(mealPlan.getVersion(), 1);
    assert.equal(mealPlan.domainEvents.length, 0);
  });

  it('rejects more than maximum allowed meals', () => {
    const meals = Array.from({ length: MEAL_PLAN_MAX_MEALS + 1 }, (_, index) =>
      MealPlanMeal.create({
        sortOrder: index + 1,
        name: MealName.create(`Meal ${index + 1}`),
        content: MealContent.create('Content'),
      }),
    );

    assert.throws(
      () => createDraftMealPlan({ meals }),
      MealPlanMaxMealsExceededDomainError,
    );
  });

  it('cancel emits MealPlanCancelled without clinical text', () => {
    const mealPlan = createDraftMealPlan();
    mealPlan.clearDomainEvents();

    mealPlan.cancel({}, LATER);

    const event = mealPlan.domainEvents[0] as MealPlanCancelled;
    assert.equal(event.eventName, 'MealPlanCancelled');
    assertEventHasNoClinicalText(event);
  });

  it('getEffectiveAt returns activatedAt when active otherwise createdAt', () => {
    const draft = createDraftMealPlan();
    assert.deepEqual(draft.getEffectiveAt(), NOW);

    activateMealPlan(draft, LATER);
    assert.deepEqual(draft.getEffectiveAt(), LATER);
  });
});
