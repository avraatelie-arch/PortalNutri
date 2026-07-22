export interface ChangeClinicalEvolutionResponsibleNutritionistRequest {
  tenantId: string;
  clinicalEvolutionId: string;
  responsibleNutritionistId: string;
}

export class ChangeClinicalEvolutionResponsibleNutritionistCommand {
  constructor(readonly request: ChangeClinicalEvolutionResponsibleNutritionistRequest) {}
}
