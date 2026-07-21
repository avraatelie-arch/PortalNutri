export interface ActivateMealPlanRequest {
  tenantId: string;
  mealPlanId: string;
}

export class ActivateMealPlanCommand {
  constructor(readonly request: ActivateMealPlanRequest) {}
}
