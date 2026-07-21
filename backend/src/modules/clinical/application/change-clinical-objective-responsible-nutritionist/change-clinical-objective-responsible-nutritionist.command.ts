export interface ChangeClinicalObjectiveResponsibleNutritionistRequest {
  tenantId: string;
  clinicalObjectiveId: string;
  responsibleNutritionistId: string;
}

export class ChangeClinicalObjectiveResponsibleNutritionistCommand {
  constructor(readonly request: ChangeClinicalObjectiveResponsibleNutritionistRequest) {}
}
