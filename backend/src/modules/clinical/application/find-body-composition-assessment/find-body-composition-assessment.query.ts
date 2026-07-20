export interface FindBodyCompositionAssessmentRequest {
  tenantId: string;
  assessmentId: string;
}

export class FindBodyCompositionAssessmentQuery {
  constructor(readonly request: FindBodyCompositionAssessmentRequest) {}
}
