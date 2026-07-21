export interface FindActiveClinicalObjectivesByPatientRequest {
  tenantId: string;
  patientId: string;
}

export class FindActiveClinicalObjectivesByPatientQuery {
  constructor(readonly request: FindActiveClinicalObjectivesByPatientRequest) {}
}
