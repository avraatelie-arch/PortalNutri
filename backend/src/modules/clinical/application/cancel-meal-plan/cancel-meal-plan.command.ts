export interface CancelMealPlanRequest {
  tenantId: string;
  mealPlanId: string;
  cancellationReason?: string | null;
}

export class CancelMealPlanCommand {
  constructor(readonly request: CancelMealPlanRequest) {}
}
