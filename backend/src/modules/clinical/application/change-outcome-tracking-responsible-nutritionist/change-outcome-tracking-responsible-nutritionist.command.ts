export interface ChangeOutcomeTrackingResponsibleNutritionistRequest {
  tenantId: string;
  outcomeTrackingId: string;
  responsibleNutritionistId: string;
}

export class ChangeOutcomeTrackingResponsibleNutritionistCommand {
  constructor(readonly request: ChangeOutcomeTrackingResponsibleNutritionistRequest) {}
}
