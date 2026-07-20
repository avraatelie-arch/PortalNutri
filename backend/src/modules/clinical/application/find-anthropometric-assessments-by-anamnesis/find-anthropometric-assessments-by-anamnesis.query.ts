export interface FindAnthropometricAssessmentsByAnamnesisRequest {
  tenantId: string;
  anamnesisId: string;
}

export class FindAnthropometricAssessmentsByAnamnesisQuery {
  constructor(readonly request: FindAnthropometricAssessmentsByAnamnesisRequest) {}
}
