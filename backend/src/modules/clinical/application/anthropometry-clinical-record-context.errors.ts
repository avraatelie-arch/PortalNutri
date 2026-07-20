import type { ClinicalRecordContextErrors } from './clinical-record-context.js';
import { AnamnesisClinicalEncounterMismatchError } from './errors/anamnesis-clinical-encounter-mismatch.error.js';
import { AnamnesisNotDraftForAnthropometryError } from './errors/anamnesis-not-draft-for-anthropometry.error.js';
import { AnamnesisNotFoundForAnthropometryError } from './errors/anamnesis-not-found-for-anthropometry.error.js';
import { AnamnesisNutritionistMismatchError } from './errors/anamnesis-nutritionist-mismatch.error.js';
import { AnamnesisPatientMismatchError } from './errors/anamnesis-patient-mismatch.error.js';
import { AnthropometricAssessmentBeforeBirthError } from './errors/anthropometric-assessment-before-birth.error.js';
import { AnthropometricAssessmentFutureDateError } from './errors/anthropometric-assessment-future-date.error.js';
import { ClinicalEncounterNotFoundForAnthropometryError } from './errors/clinical-encounter-not-found-for-anthropometry.error.js';
import { ClinicalEncounterNotOpenForAnthropometryError } from './errors/clinical-encounter-not-open-for-anthropometry.error.js';
import { ClinicalEncounterNutritionistMismatchError } from './errors/clinical-encounter-nutritionist-mismatch.error.js';
import { ClinicalEncounterPatientMismatchError } from './errors/clinical-encounter-patient-mismatch.error.js';
import { ClinicalEncounterTenantMismatchError } from './errors/clinical-encounter-tenant-mismatch.error.js';
import { NutritionistInactiveForAnthropometryError } from './errors/nutritionist-inactive-for-anthropometry.error.js';
import { NutritionistNotFoundForAnthropometryError } from './errors/nutritionist-not-found-for-anthropometry.error.js';
import { PatientInactiveForAnthropometryError } from './errors/patient-inactive-for-anthropometry.error.js';
import { PatientNotFoundForAnthropometryError } from './errors/patient-not-found-for-anthropometry.error.js';
import { TenantInactiveForAnthropometryError } from './errors/tenant-inactive-for-anthropometry.error.js';
import { TenantNotFoundForAnthropometryError } from './errors/tenant-not-found-for-anthropometry.error.js';

export function createAnthropometryClinicalRecordContextErrors(): ClinicalRecordContextErrors {
  return {
    tenantNotFound: (tenantId) => new TenantNotFoundForAnthropometryError(tenantId),
    tenantInactive: (tenantId) => new TenantInactiveForAnthropometryError(tenantId),
    anamnesisNotFound: (tenantId, anamnesisId) =>
      new AnamnesisNotFoundForAnthropometryError(tenantId, anamnesisId),
    anamnesisNotDraft: (tenantId, anamnesisId) =>
      new AnamnesisNotDraftForAnthropometryError(tenantId, anamnesisId),
    anamnesisClinicalEncounterMismatch: (tenantId, anamnesisId, clinicalEncounterId) =>
      new AnamnesisClinicalEncounterMismatchError(
        tenantId,
        anamnesisId,
        clinicalEncounterId,
      ),
    anamnesisPatientMismatch: (tenantId, anamnesisId, patientId) =>
      new AnamnesisPatientMismatchError(tenantId, anamnesisId, patientId),
    anamnesisNutritionistMismatch: (tenantId, anamnesisId, nutritionistId) =>
      new AnamnesisNutritionistMismatchError(tenantId, anamnesisId, nutritionistId),
    clinicalEncounterNotFound: (tenantId, clinicalEncounterId) =>
      new ClinicalEncounterNotFoundForAnthropometryError(tenantId, clinicalEncounterId),
    clinicalEncounterNotOpen: (tenantId, clinicalEncounterId) =>
      new ClinicalEncounterNotOpenForAnthropometryError(tenantId, clinicalEncounterId),
    clinicalEncounterPatientMismatch: (tenantId, clinicalEncounterId, patientId) =>
      new ClinicalEncounterPatientMismatchError(
        tenantId,
        clinicalEncounterId,
        patientId,
      ),
    clinicalEncounterNutritionistMismatch: (
      tenantId,
      clinicalEncounterId,
      nutritionistId,
    ) =>
      new ClinicalEncounterNutritionistMismatchError(
        tenantId,
        clinicalEncounterId,
        nutritionistId,
      ),
    patientNotFound: (tenantId, patientId) =>
      new PatientNotFoundForAnthropometryError(tenantId, patientId),
    patientInactive: (tenantId, patientId) =>
      new PatientInactiveForAnthropometryError(tenantId, patientId),
    nutritionistNotFound: (tenantId, nutritionistId) =>
      new NutritionistNotFoundForAnthropometryError(tenantId, nutritionistId),
    nutritionistInactive: (tenantId, nutritionistId) =>
      new NutritionistInactiveForAnthropometryError(tenantId, nutritionistId),
    nutritionistTenantMismatch: (tenantId, nutritionistId) =>
      new ClinicalEncounterTenantMismatchError(tenantId, 'nutritionist', nutritionistId),
    measuredAtFutureDate: (tenantId, patientId) =>
      new AnthropometricAssessmentFutureDateError(tenantId, patientId),
    measuredAtBeforeBirth: (tenantId, patientId) =>
      new AnthropometricAssessmentBeforeBirthError(tenantId, patientId),
  };
}
