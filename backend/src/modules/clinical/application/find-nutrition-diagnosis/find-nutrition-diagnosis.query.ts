export interface FindNutritionDiagnosisRequest {
  tenantId: string;
  nutritionDiagnosisId: string;
}

export class FindNutritionDiagnosisQuery {
  constructor(readonly request: FindNutritionDiagnosisRequest) {}
}
