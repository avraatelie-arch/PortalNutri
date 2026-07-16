export interface AssignNutritionistToPatientRequest {
  tenantId: string;
  patientId: string;
  nutritionistId: string;
  role: string;
}

export class AssignNutritionistToPatientCommand {
  constructor(readonly request: AssignNutritionistToPatientRequest) {}
}
