export interface EditNutritionDiagnosisRequest {
  tenantId: string;
  nutritionDiagnosisId: string;
  problemCategory?: string;
  professionalInterpretation?: string | null;
}

export class EditNutritionDiagnosisCommand {
  constructor(readonly request: EditNutritionDiagnosisRequest) {}
}
