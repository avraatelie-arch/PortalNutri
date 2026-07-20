import type { Anamnesis } from '../domain/aggregates/anamnesis.aggregate.js';
import type { AnamnesisStatus } from '../domain/value-objects/anamnesis-status.js';

export interface AnamnesisResult {
  id: string;
  tenantId: string;
  clinicalEncounterId: string;
  patientId: string;
  nutritionistId: string;
  status: AnamnesisStatus;
  version: number;
  chiefComplaint: string | null;
  currentHistory: string | null;
  medicalHistory: string | null;
  familyHistory: string | null;
  gastrointestinalHistory: string | null;
  dietaryHistory: string | null;
  lifestyleHistory: string | null;
  medicationHistory: string | null;
  supplementHistory: string | null;
  allergiesAndIntolerances: string | null;
  observations: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toAnamnesisResult(anamnesis: Anamnesis): AnamnesisResult {
  return {
    id: anamnesis.getId().toString(),
    tenantId: anamnesis.getTenantId(),
    clinicalEncounterId: anamnesis.getClinicalEncounterId(),
    patientId: anamnesis.getPatientId(),
    nutritionistId: anamnesis.getNutritionistId(),
    status: anamnesis.getStatus(),
    version: anamnesis.getVersion(),
    chiefComplaint: anamnesis.getChiefComplaint().toPersistence(),
    currentHistory: anamnesis.getCurrentHistory().toPersistence(),
    medicalHistory: anamnesis.getMedicalHistory().toPersistence(),
    familyHistory: anamnesis.getFamilyHistory().toPersistence(),
    gastrointestinalHistory: anamnesis.getGastrointestinalHistory().toPersistence(),
    dietaryHistory: anamnesis.getDietaryHistory().toPersistence(),
    lifestyleHistory: anamnesis.getLifestyleHistory().toPersistence(),
    medicationHistory: anamnesis.getMedicationHistory().toPersistence(),
    supplementHistory: anamnesis.getSupplementHistory().toPersistence(),
    allergiesAndIntolerances: anamnesis.getAllergiesAndIntolerances().toPersistence(),
    observations: anamnesis.getObservations().toPersistence(),
    completedAt: anamnesis.getCompletedAt()?.toISOString() ?? null,
    createdAt: anamnesis.getCreatedAt().toISOString(),
    updatedAt: anamnesis.getUpdatedAt().toISOString(),
  };
}
