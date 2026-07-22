export interface ChangePrescriptionResponsibleNutritionistRequest {
  tenantId: string;
  prescriptionId: string;
  responsibleNutritionistId: string;
}

export class ChangePrescriptionResponsibleNutritionistCommand {
  constructor(readonly request: ChangePrescriptionResponsibleNutritionistRequest) {}
}
