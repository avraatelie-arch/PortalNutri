export interface ChangeNutritionDiagnosisResponsibleNutritionistRequest {
  tenantId: string;
  nutritionDiagnosisId: string;
  responsibleNutritionistId: string;
}

export class ChangeNutritionDiagnosisResponsibleNutritionistCommand {
  constructor(readonly request: ChangeNutritionDiagnosisResponsibleNutritionistRequest) {}
}
