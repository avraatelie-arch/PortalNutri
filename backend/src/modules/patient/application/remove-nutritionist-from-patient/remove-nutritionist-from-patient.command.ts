export interface RemoveNutritionistFromPatientRequest {
  tenantId: string;
  patientId: string;
  nutritionistId: string;
}

export class RemoveNutritionistFromPatientCommand {
  constructor(readonly request: RemoveNutritionistFromPatientRequest) {}
}
