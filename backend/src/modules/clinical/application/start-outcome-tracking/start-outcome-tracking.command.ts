export interface StartOutcomeTrackingRequest {
  tenantId: string;
  patientId: string;
  clinicalObjectiveId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId?: string | null;
  originAnamnesisId?: string | null;
}

export class StartOutcomeTrackingCommand {
  constructor(readonly request: StartOutcomeTrackingRequest) {}
}
