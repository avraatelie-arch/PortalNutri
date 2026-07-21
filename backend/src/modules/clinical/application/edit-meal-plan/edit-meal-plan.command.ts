import type { MealPlanMealRequest } from '../create-meal-plan/create-meal-plan.command.js';

export interface EditMealPlanRequest {
  tenantId: string;
  mealPlanId: string;
  title?: string;
  planType?: string | null;
  therapeuticStrategy?: string | null;
  generalGuidelines?: string | null;
  clinicalNotes?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
  meals?: MealPlanMealRequest[];
}

export class EditMealPlanCommand {
  constructor(readonly request: EditMealPlanRequest) {}
}
