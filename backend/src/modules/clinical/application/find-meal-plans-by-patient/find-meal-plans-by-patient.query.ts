export interface FindMealPlansByPatientRequest {
  tenantId: string;
  patientId: string;
  status?: string;
}

export class FindMealPlansByPatientQuery {
  constructor(readonly request: FindMealPlansByPatientRequest) {}
}
