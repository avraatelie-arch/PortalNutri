export interface FindAnthropometricAssessmentRequest {
  tenantId: string;
  assessmentId: string;
}

export class FindAnthropometricAssessmentQuery {
  constructor(readonly request: FindAnthropometricAssessmentRequest) {}
}
