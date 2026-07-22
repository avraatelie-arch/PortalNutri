export interface CancelClinicalEvolutionRequest {
  tenantId: string;
  clinicalEvolutionId: string;
}

export class CancelClinicalEvolutionCommand {
  constructor(readonly request: CancelClinicalEvolutionRequest) {}
}
