export interface CreateNutritionDiagnosisRequest {
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId?: string | null;
  originAnamnesisId?: string | null;
  problemCategory?: string;
  professionalInterpretation?: string | null;
}

export class CreateNutritionDiagnosisCommand {
  constructor(readonly request: CreateNutritionDiagnosisRequest) {}
}
