export interface FindPreviousFinalizedClinicalEvolutionRequest {
  tenantId: string;
  clinicalEvolutionId: string;
}

export class FindPreviousFinalizedClinicalEvolutionQuery {
  constructor(readonly request: FindPreviousFinalizedClinicalEvolutionRequest) {}
}
