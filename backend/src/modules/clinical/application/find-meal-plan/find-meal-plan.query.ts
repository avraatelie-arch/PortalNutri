export interface FindMealPlanRequest {
  tenantId: string;
  mealPlanId: string;
}

export class FindMealPlanQuery {
  constructor(readonly request: FindMealPlanRequest) {}
}
