import type { MealPlan } from '../domain/aggregates/meal-plan.aggregate.js';
import type { MealPlanStatus } from '../domain/value-objects/meal-plan-status.js';
import type { MealPlanTypeValueType } from '../domain/value-objects/meal-plan-type.js';

export interface MealPlanMealResult {
  id: string;
  sortOrder: number;
  name: string;
  scheduledTime: string | null;
  content: string | null;
  substitutionNotes: string | null;
}

export interface MealPlanResult {
  id: string;
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId: string | null;
  originAnamnesisId: string | null;
  planType: MealPlanTypeValueType | null;
  status: MealPlanStatus;
  version: number;
  title: string;
  therapeuticStrategy: string | null;
  generalGuidelines: string | null;
  clinicalNotes: string | null;
  validFrom: string | null;
  validUntil: string | null;
  cancellationReason: string | null;
  activatedAt: string | null;
  cancelledAt: string | null;
  meals: MealPlanMealResult[];
  createdAt: string;
  updatedAt: string;
}

export function toMealPlanResult(mealPlan: MealPlan): MealPlanResult {
  return {
    id: mealPlan.getId().toString(),
    tenantId: mealPlan.getTenantId(),
    patientId: mealPlan.getPatientId(),
    createdByNutritionistId: mealPlan.getCreatedByNutritionistId(),
    responsibleNutritionistId: mealPlan.getResponsibleNutritionistId(),
    originClinicalEncounterId: mealPlan.getOriginClinicalEncounterId(),
    originAnamnesisId: mealPlan.getOriginAnamnesisId(),
    planType: mealPlan.getPlanType()?.toPersistence() ?? null,
    status: mealPlan.getStatus(),
    version: mealPlan.getVersion(),
    title: mealPlan.getTitle().toPersistence(),
    therapeuticStrategy: mealPlan.getTherapeuticStrategy().toPersistence(),
    generalGuidelines: mealPlan.getGeneralGuidelines().toPersistence(),
    clinicalNotes: mealPlan.getClinicalNotes().toPersistence(),
    validFrom: mealPlan.getValidFrom()?.toISOString() ?? null,
    validUntil: mealPlan.getValidUntil()?.toISOString() ?? null,
    cancellationReason: mealPlan.getCancellationReason()?.toPersistence() ?? null,
    activatedAt: mealPlan.getActivatedAt()?.toISOString() ?? null,
    cancelledAt: mealPlan.getCancelledAt()?.toISOString() ?? null,
    meals: mealPlan.getMeals().map((meal) => ({
      id: meal.getId().toString(),
      sortOrder: meal.getSortOrder(),
      name: meal.getName().toPersistence(),
      scheduledTime: meal.getScheduledTime()?.toPersistence() ?? null,
      content: meal.getContent().toPersistence(),
      substitutionNotes: meal.getSubstitutionNotes().toPersistence(),
    })),
    createdAt: mealPlan.getCreatedAt().toISOString(),
    updatedAt: mealPlan.getUpdatedAt().toISOString(),
  };
}
