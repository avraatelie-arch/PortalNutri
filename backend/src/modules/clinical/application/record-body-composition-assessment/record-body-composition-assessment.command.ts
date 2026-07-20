export interface RecordBodyCompositionAssessmentRequest {
  tenantId: string;
  anamnesisId: string;
  clinicalEncounterId: string;
  patientId: string;
  nutritionistId: string;
  bodyFatPercentage: string;
  measurementSource: string;
  leanMassKg?: string;
  fatMassKg?: string;
  muscleMassKg?: string;
  boneMassKg?: string;
  bodyWaterPercentage?: string;
  visceralFatLevel?: string;
  basalMetabolicRate?: string;
  metabolicAge?: string;
  notes?: string;
  anthropometricAssessmentId?: string;
  measuredAt?: Date;
  sourceRequestId?: string;
}

export class RecordBodyCompositionAssessmentCommand {
  constructor(readonly request: RecordBodyCompositionAssessmentRequest) {}
}
