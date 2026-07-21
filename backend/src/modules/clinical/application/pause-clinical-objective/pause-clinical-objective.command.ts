export interface PauseClinicalObjectiveRequest {
  tenantId: string;
  clinicalObjectiveId: string;
}

export class PauseClinicalObjectiveCommand {
  constructor(readonly request: PauseClinicalObjectiveRequest) {}
}
