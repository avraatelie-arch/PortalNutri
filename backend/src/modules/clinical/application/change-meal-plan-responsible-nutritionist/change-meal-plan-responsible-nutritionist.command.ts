export interface ChangeMealPlanResponsibleNutritionistRequest {
  tenantId: string;
  mealPlanId: string;
  responsibleNutritionistId: string;
}

export class ChangeMealPlanResponsibleNutritionistCommand {
  constructor(readonly request: ChangeMealPlanResponsibleNutritionistRequest) {}
}
