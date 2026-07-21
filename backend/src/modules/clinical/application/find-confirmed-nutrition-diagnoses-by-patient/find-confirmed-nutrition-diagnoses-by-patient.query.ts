export interface FindConfirmedNutritionDiagnosesByPatientRequest {
  tenantId: string;
  patientId: string;
}

export class FindConfirmedNutritionDiagnosesByPatientQuery {
  constructor(readonly request: FindConfirmedNutritionDiagnosesByPatientRequest) {}
}
