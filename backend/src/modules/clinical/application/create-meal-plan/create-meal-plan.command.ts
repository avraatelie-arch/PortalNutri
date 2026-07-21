export interface MealPlanMealRequest {
  sortOrder: number;
  name: string;
  scheduledTime?: string | null;
  content?: string | null;
  substitutionNotes?: string | null;
}

export interface CreateMealPlanRequest {
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId?: string | null;
  originAnamnesisId?: string | null;
  planType?: string | null;
  title?: string;
  therapeuticStrategy?: string | null;
  generalGuidelines?: string | null;
  clinicalNotes?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
  meals?: MealPlanMealRequest[];
}

export class CreateMealPlanCommand {
  constructor(readonly request: CreateMealPlanRequest) {}
}
