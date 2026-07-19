export interface FindClinicalEncounterRequest {
  tenantId: string;
  encounterId: string;
}

export class FindClinicalEncounterQuery {
  constructor(readonly request: FindClinicalEncounterRequest) {}
}
