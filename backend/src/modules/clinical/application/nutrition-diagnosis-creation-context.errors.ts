import type { NutritionDiagnosisCreationContextErrors } from '../nutrition-diagnosis-creation-context.js';
import { AnamnesisNotFoundForNutritionDiagnosisError } from './errors/anamnesis-not-found-for-nutrition-diagnosis.error.js';
import { ClinicalEncounterNotFoundForNutritionDiagnosisError } from './errors/clinical-encounter-not-found-for-nutrition-diagnosis.error.js';
import { ClinicalEncounterNotOpenForNutritionDiagnosisError } from './errors/clinical-encounter-not-open-for-nutrition-diagnosis.error.js';
import { ClinicalEncounterPatientMismatchForNutritionDiagnosisError } from './errors/clinical-encounter-patient-mismatch-for-nutrition-diagnosis.error.js';
import { NutritionDiagnosisOriginAnamnesisEncounterMismatchError } from './errors/nutrition-diagnosis-origin-anamnesis-encounter-mismatch.error.js';
import { NutritionDiagnosisOriginAnamnesisPatientMismatchError } from './errors/nutrition-diagnosis-origin-anamnesis-patient-mismatch.error.js';
import { NutritionistInactiveForNutritionDiagnosisError } from './errors/nutritionist-inactive-for-nutrition-diagnosis.error.js';
import { NutritionistNotFoundForNutritionDiagnosisError } from './errors/nutritionist-not-found-for-nutrition-diagnosis.error.js';
import { PatientInactiveForNutritionDiagnosisError } from './errors/patient-inactive-for-nutrition-diagnosis.error.js';
import { PatientNotFoundForNutritionDiagnosisError } from './errors/patient-not-found-for-nutrition-diagnosis.error.js';
import { TenantInactiveForNutritionDiagnosisError } from './errors/tenant-inactive-for-nutrition-diagnosis.error.js';
import { TenantNotFoundForNutritionDiagnosisError } from './errors/tenant-not-found-for-nutrition-diagnosis.error.js';

export function createNutritionDiagnosisCreationContextErrors(): NutritionDiagnosisCreationContextErrors {
  return {
    tenantNotFound: (tenantId) => new TenantNotFoundForNutritionDiagnosisError(tenantId),
    tenantInactive: (tenantId) => new TenantInactiveForNutritionDiagnosisError(tenantId),
    patientNotFound: (tenantId, patientId) =>
      new PatientNotFoundForNutritionDiagnosisError(tenantId, patientId),
    patientInactive: (tenantId, patientId) =>
      new PatientInactiveForNutritionDiagnosisError(tenantId, patientId),
    nutritionistNotFound: (tenantId, nutritionistId) =>
      new NutritionistNotFoundForNutritionDiagnosisError(tenantId, nutritionistId),
    nutritionistInactive: (tenantId, nutritionistId) =>
      new NutritionistInactiveForNutritionDiagnosisError(tenantId, nutritionistId),
    clinicalEncounterNotFound: (tenantId, clinicalEncounterId) =>
      new ClinicalEncounterNotFoundForNutritionDiagnosisError(
        tenantId,
        clinicalEncounterId,
      ),
    clinicalEncounterNotOpen: (tenantId, clinicalEncounterId) =>
      new ClinicalEncounterNotOpenForNutritionDiagnosisError(
        tenantId,
        clinicalEncounterId,
      ),
    clinicalEncounterPatientMismatch: (tenantId, clinicalEncounterId, patientId) =>
      new ClinicalEncounterPatientMismatchForNutritionDiagnosisError(
        tenantId,
        clinicalEncounterId,
        patientId,
      ),
    anamnesisNotFound: (tenantId, anamnesisId) =>
      new AnamnesisNotFoundForNutritionDiagnosisError(tenantId, anamnesisId),
    originAnamnesisEncounterMismatch: (tenantId, anamnesisId, clinicalEncounterId) =>
      new NutritionDiagnosisOriginAnamnesisEncounterMismatchError(
        tenantId,
        anamnesisId,
        clinicalEncounterId,
      ),
    originAnamnesisPatientMismatch: (tenantId, anamnesisId, patientId) =>
      new NutritionDiagnosisOriginAnamnesisPatientMismatchError(
        tenantId,
        anamnesisId,
        patientId,
      ),
  };
}
