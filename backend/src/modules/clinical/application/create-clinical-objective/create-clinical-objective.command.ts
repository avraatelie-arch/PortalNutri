export interface CreateClinicalObjectiveRequest {
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId?: string | null;
  originAnamnesisId?: string | null;
  type: string;
  priority?: string;
  title?: string | null;
  clinicalRationale?: string | null;
  successCriteria?: string | null;
  targetDate?: Date | null;
}

export class CreateClinicalObjectiveCommand {
  constructor(readonly request: CreateClinicalObjectiveRequest) {}
}
