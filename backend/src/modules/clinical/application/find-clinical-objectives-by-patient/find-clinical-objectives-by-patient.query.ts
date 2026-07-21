export interface FindClinicalObjectivesByPatientRequest {
  tenantId: string;
  patientId: string;
  status?: string;
}

export class FindClinicalObjectivesByPatientQuery {
  constructor(readonly request: FindClinicalObjectivesByPatientRequest) {}
}
