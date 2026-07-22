export interface PrescriptionLineRequest {
  sortOrder: number;
  description?: string;
  doseQuantity?: string | null;
  doseUnit?: string | null;
  doseUnitCustomDisplay?: string | null;
  frequencyDisplayText?: string | null;
  frequencyTimesPerDay?: number | null;
  frequencyIntervalHours?: number | null;
  dosageForm?: string | null;
  administrationRoute?: string | null;
  activeIngredients?: string | null;
  concentration?: string | null;
  duration?: string | null;
  administrationInstructions?: string | null;
  lineClinicalNotes?: string | null;
  patientInstructions?: string | null;
}

export interface CreatePrescriptionRequest {
  tenantId: string;
  patientId: string;
  createdByNutritionistId: string;
  responsibleNutritionistId: string;
  originClinicalEncounterId?: string | null;
  originAnamnesisId?: string | null;
  title?: string;
  clinicalNotes?: string | null;
  patientInstructions?: string | null;
  lines?: PrescriptionLineRequest[];
}

export class CreatePrescriptionCommand {
  constructor(readonly request: CreatePrescriptionRequest) {}
}
