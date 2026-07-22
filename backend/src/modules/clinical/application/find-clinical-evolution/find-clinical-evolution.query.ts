export interface FindClinicalEvolutionRequest {
  tenantId: string;
  clinicalEvolutionId: string;
}

export class FindClinicalEvolutionQuery {
  constructor(readonly request: FindClinicalEvolutionRequest) {}
}
