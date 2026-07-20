export interface RecordAnthropometricAssessmentRequest {
  tenantId: string;
  anamnesisId: string;
  clinicalEncounterId: string;
  patientId: string;
  nutritionistId: string;
  weightKg: string;
  heightCm: string;
  waistCircumferenceCm?: string;
  hipCircumferenceCm?: string;
  abdominalCircumferenceCm?: string;
  neckCircumferenceCm?: string;
  armCircumferenceCm?: string;
  calfCircumferenceCm?: string;
  notes?: string;
  measuredAt?: Date;
  sourceRequestId?: string;
}

export class RecordAnthropometricAssessmentCommand {
  constructor(readonly request: RecordAnthropometricAssessmentRequest) {}
}
