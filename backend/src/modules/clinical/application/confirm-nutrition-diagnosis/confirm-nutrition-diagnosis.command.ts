export interface ConfirmNutritionDiagnosisRequest {
  tenantId: string;
  nutritionDiagnosisId: string;
}

export class ConfirmNutritionDiagnosisCommand {
  constructor(readonly request: ConfirmNutritionDiagnosisRequest) {}
}
