export interface CancelClinicalObjectiveRequest {
  tenantId: string;
  clinicalObjectiveId: string;
}

export class CancelClinicalObjectiveCommand {
  constructor(readonly request: CancelClinicalObjectiveRequest) {}
}
