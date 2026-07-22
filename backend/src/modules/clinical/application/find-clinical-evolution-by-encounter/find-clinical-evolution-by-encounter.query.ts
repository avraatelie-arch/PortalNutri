export interface FindClinicalEvolutionByEncounterRequest {
  tenantId: string;
  clinicalEncounterId: string;
}

export class FindClinicalEvolutionByEncounterQuery {
  constructor(readonly request: FindClinicalEvolutionByEncounterRequest) {}
}
