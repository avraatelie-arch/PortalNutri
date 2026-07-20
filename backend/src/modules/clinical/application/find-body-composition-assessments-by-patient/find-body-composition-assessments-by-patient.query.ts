export interface FindBodyCompositionAssessmentsByPatientRequest {
  tenantId: string;
  patientId: string;
  measuredFrom?: Date;
  measuredTo?: Date;
}

export class FindBodyCompositionAssessmentsByPatientQuery {
  constructor(readonly request: FindBodyCompositionAssessmentsByPatientRequest) {}
}
