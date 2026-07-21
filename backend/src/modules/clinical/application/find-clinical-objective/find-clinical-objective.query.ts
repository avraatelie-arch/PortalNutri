export interface FindClinicalObjectiveRequest {
  tenantId: string;
  clinicalObjectiveId: string;
}

export class FindClinicalObjectiveQuery {
  constructor(readonly request: FindClinicalObjectiveRequest) {}
}
