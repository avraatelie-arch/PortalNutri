export interface FindActiveMealPlansByPatientRequest {
  tenantId: string;
  patientId: string;
}

export class FindActiveMealPlansByPatientQuery {
  constructor(readonly request: FindActiveMealPlansByPatientRequest) {}
}
