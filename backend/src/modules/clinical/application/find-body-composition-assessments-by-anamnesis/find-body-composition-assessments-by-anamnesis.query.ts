export interface FindBodyCompositionAssessmentsByAnamnesisRequest {
  tenantId: string;
  anamnesisId: string;
}

export class FindBodyCompositionAssessmentsByAnamnesisQuery {
  constructor(readonly request: FindBodyCompositionAssessmentsByAnamnesisRequest) {}
}
