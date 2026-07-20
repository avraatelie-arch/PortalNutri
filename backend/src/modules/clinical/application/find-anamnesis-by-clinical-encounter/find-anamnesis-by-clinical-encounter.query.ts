export interface FindAnamnesisByClinicalEncounterRequest {
  tenantId: string;
  clinicalEncounterId: string;
}

export class FindAnamnesisByClinicalEncounterQuery {
  constructor(readonly request: FindAnamnesisByClinicalEncounterRequest) {}
}
