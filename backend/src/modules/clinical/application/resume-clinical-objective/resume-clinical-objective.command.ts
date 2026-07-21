export interface ResumeClinicalObjectiveRequest {
  tenantId: string;
  clinicalObjectiveId: string;
}

export class ResumeClinicalObjectiveCommand {
  constructor(readonly request: ResumeClinicalObjectiveRequest) {}
}
