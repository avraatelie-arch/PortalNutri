export interface ActivateClinicalObjectiveRequest {
  tenantId: string;
  clinicalObjectiveId: string;
}

export class ActivateClinicalObjectiveCommand {
  constructor(readonly request: ActivateClinicalObjectiveRequest) {}
}
