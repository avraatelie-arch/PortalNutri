import type { MealPlanMeal as MealPlanMealRecord, MealPlan as MealPlanRecord } from '@prisma/client';
import { MealPlan } from '../../domain/aggregates/meal-plan.aggregate.js';
import { MealPlanMeal } from '../../domain/entities/meal-plan-meal.js';
import { GeneralGuidelines } from '../../domain/value-objects/general-guidelines.js';
import { MealContent } from '../../domain/value-objects/meal-content.js';
import { MealName } from '../../domain/value-objects/meal-name.js';
import { MealPlanCancellationReason } from '../../domain/value-objects/meal-plan-cancellation-reason.js';
import { MealPlanClinicalNotes } from '../../domain/value-objects/meal-plan-clinical-notes.js';
import { MealPlanId } from '../../domain/value-objects/meal-plan-id.js';
import { MealPlanMealId } from '../../domain/value-objects/meal-plan-meal-id.js';
import { parseMealPlanStatus } from '../../domain/value-objects/meal-plan-status.js';
import { MealPlanTitle } from '../../domain/value-objects/meal-plan-title.js';
import { MealPlanType } from '../../domain/value-objects/meal-plan-type.js';
import { MealScheduledTime } from '../../domain/value-objects/meal-scheduled-time.js';
import { MealSubstitutionNotes } from '../../domain/value-objects/meal-substitution-notes.js';
import { TherapeuticStrategy } from '../../domain/value-objects/therapeutic-strategy.js';

export type MealPlanWithMealsRecord = MealPlanRecord & {
  meals: MealPlanMealRecord[];
};

export type MealPlanPersistenceInput = {
  id: string;
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId: string | null;
  originAnamnesisId: string | null;
  planType: MealPlanRecord['planType'];
  status: MealPlanRecord['status'];
  title: string;
  therapeuticStrategy: string | null;
  generalGuidelines: string | null;
  clinicalNotes: string | null;
  validFrom: Date | null;
  validUntil: Date | null;
  cancellationReason: string | null;
  activatedAt: Date | null;
  cancelledAt: Date | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

export type MealPlanMealPersistenceInput = {
  id: string;
  mealPlanId: string;
  sortOrder: number;
  name: string;
  scheduledTime: string | null;
  content: string | null;
  substitutionNotes: string | null;
};

export function toPersistence(mealPlan: MealPlan): MealPlanPersistenceInput {
  return {
    id: mealPlan.getId().toString(),
    tenantId: mealPlan.getTenantId(),
    patientId: mealPlan.getPatientId(),
    createdByNutritionistId: mealPlan.getCreatedByNutritionistId(),
    responsibleNutritionistId: mealPlan.getResponsibleNutritionistId(),
    originClinicalEncounterId: mealPlan.getOriginClinicalEncounterId(),
    originAnamnesisId: mealPlan.getOriginAnamnesisId(),
    planType: mealPlan.getPlanType()?.toPersistence() ?? null,
    status: mealPlan.getStatus() as MealPlanRecord['status'],
    title: mealPlan.getTitle().toPersistence(),
    therapeuticStrategy: mealPlan.getTherapeuticStrategy().toPersistence(),
    generalGuidelines: mealPlan.getGeneralGuidelines().toPersistence(),
    clinicalNotes: mealPlan.getClinicalNotes().toPersistence(),
    validFrom: mealPlan.getValidFrom(),
    validUntil: mealPlan.getValidUntil(),
    cancellationReason: mealPlan.getCancellationReason()?.toPersistence() ?? null,
    activatedAt: mealPlan.getActivatedAt(),
    cancelledAt: mealPlan.getCancelledAt(),
    version: mealPlan.getVersion(),
    createdAt: mealPlan.getCreatedAt(),
    updatedAt: mealPlan.getUpdatedAt(),
  };
}

export function toMealsPersistence(mealPlan: MealPlan): MealPlanMealPersistenceInput[] {
  return mealPlan.getMeals().map((meal) => ({
    id: meal.getId().toString(),
    mealPlanId: mealPlan.getId().toString(),
    sortOrder: meal.getSortOrder(),
    name: meal.getName().toPersistence(),
    scheduledTime: meal.getScheduledTime()?.toPersistence() ?? null,
    content: meal.getContent().toPersistence(),
    substitutionNotes: meal.getSubstitutionNotes().toPersistence(),
  }));
}

export function toDomain(record: MealPlanWithMealsRecord): MealPlan {
  return MealPlan.reconstitute({
    id: MealPlanId.create(record.id),
    tenantId: record.tenantId,
    patientId: record.patientId,
    createdByNutritionistId: record.createdByNutritionistId,
    responsibleNutritionistId: record.responsibleNutritionistId,
    originClinicalEncounterId: record.originClinicalEncounterId,
    originAnamnesisId: record.originAnamnesisId,
    planType: MealPlanType.fromPersistence(record.planType),
    status: parseMealPlanStatus(record.status),
    version: record.version,
    title: MealPlanTitle.fromPersistence(record.title),
    therapeuticStrategy: TherapeuticStrategy.fromPersistence(record.therapeuticStrategy),
    generalGuidelines: GeneralGuidelines.fromPersistence(record.generalGuidelines),
    clinicalNotes: MealPlanClinicalNotes.fromPersistence(record.clinicalNotes),
    validFrom: record.validFrom,
    validUntil: record.validUntil,
    cancellationReason: MealPlanCancellationReason.fromPersistence(record.cancellationReason),
    activatedAt: record.activatedAt,
    cancelledAt: record.cancelledAt,
    meals: record.meals.map(toMealDomain),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

function toMealDomain(record: MealPlanMealRecord): MealPlanMeal {
  return MealPlanMeal.reconstitute({
    id: MealPlanMealId.create(record.id),
    sortOrder: record.sortOrder,
    name: MealName.fromPersistence(record.name),
    scheduledTime: MealScheduledTime.fromPersistence(record.scheduledTime),
    content: MealContent.fromPersistence(record.content),
    substitutionNotes: MealSubstitutionNotes.fromPersistence(record.substitutionNotes),
  });
}
