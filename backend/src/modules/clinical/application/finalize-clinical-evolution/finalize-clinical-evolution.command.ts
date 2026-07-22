export interface FinalizeClinicalEvolutionRequest {
  tenantId: string;
  clinicalEvolutionId: string;
}

export class FinalizeClinicalEvolutionCommand {
  constructor(readonly request: FinalizeClinicalEvolutionRequest) {}
}
