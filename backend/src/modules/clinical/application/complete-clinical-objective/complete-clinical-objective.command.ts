export interface CompleteClinicalObjectiveRequest {
  tenantId: string;
  clinicalObjectiveId: string;
}

export class CompleteClinicalObjectiveCommand {
  constructor(readonly request: CompleteClinicalObjectiveRequest) {}
}
