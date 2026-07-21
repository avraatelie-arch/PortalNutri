export interface FindNutritionDiagnosesByPatientRequest {
  tenantId: string;
  patientId: string;
  status?: string;
}

export class FindNutritionDiagnosesByPatientQuery {
  constructor(readonly request: FindNutritionDiagnosesByPatientRequest) {}
}
