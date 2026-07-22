export interface StartClinicalEvolutionRequest {
  tenantId: string;
  clinicalEncounterId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
}

export class StartClinicalEvolutionCommand {
  constructor(readonly request: StartClinicalEvolutionRequest) {}
}
