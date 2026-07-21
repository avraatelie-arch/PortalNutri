export interface FindLatestMealPlanByPatientRequest {
  tenantId: string;
  patientId: string;
}

export class FindLatestMealPlanByPatientQuery {
  constructor(readonly request: FindLatestMealPlanByPatientRequest) {}
}
