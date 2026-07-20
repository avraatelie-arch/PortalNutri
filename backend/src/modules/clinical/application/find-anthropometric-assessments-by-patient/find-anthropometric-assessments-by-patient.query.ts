export interface FindAnthropometricAssessmentsByPatientRequest {
  tenantId: string;
  patientId: string;
  measuredFrom?: Date;
  measuredTo?: Date;
}

export class FindAnthropometricAssessmentsByPatientQuery {
  constructor(readonly request: FindAnthropometricAssessmentsByPatientRequest) {}
}
