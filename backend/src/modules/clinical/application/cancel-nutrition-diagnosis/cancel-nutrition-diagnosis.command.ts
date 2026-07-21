export interface CancelNutritionDiagnosisRequest {
  tenantId: string;
  nutritionDiagnosisId: string;
  cancellationReason?: string | null;
}

export class CancelNutritionDiagnosisCommand {
  constructor(readonly request: CancelNutritionDiagnosisRequest) {}
}
