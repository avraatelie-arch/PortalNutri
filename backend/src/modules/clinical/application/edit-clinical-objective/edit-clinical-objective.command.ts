export interface EditClinicalObjectiveRequest {
  tenantId: string;
  clinicalObjectiveId: string;
  title?: string | null;
  clinicalRationale?: string | null;
  successCriteria?: string | null;
  priority?: string;
  targetDate?: Date | null;
}

export class EditClinicalObjectiveCommand {
  constructor(readonly request: EditClinicalObjectiveRequest) {}
}
