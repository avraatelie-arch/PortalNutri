export interface StartAnamnesisRequest {
  tenantId: string;
  clinicalEncounterId: string;
  patientId: string;
  nutritionistId: string;
}

export class StartAnamnesisCommand {
  constructor(readonly request: StartAnamnesisRequest) {}
}
