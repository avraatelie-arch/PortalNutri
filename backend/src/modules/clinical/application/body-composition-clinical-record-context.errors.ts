import type { ClinicalRecordContextErrors } from './clinical-record-context.js';
import { AnamnesisClinicalEncounterMismatchForBodyCompositionError } from './errors/anamnesis-clinical-encounter-mismatch-for-body-composition.error.js';
import { AnamnesisNotDraftForBodyCompositionError } from './errors/anamnesis-not-draft-for-body-composition.error.js';
import { AnamnesisNotFoundForBodyCompositionError } from './errors/anamnesis-not-found-for-body-composition.error.js';
import { AnamnesisNutritionistMismatchForBodyCompositionError } from './errors/anamnesis-nutritionist-mismatch-for-body-composition.error.js';
import { AnamnesisPatientMismatchForBodyCompositionError } from './errors/anamnesis-patient-mismatch-for-body-composition.error.js';
import { BodyCompositionAssessmentBeforeBirthError } from './errors/body-composition-assessment-before-birth.error.js';
import { BodyCompositionAssessmentFutureDateError } from './errors/body-composition-assessment-future-date.error.js';
import { ClinicalEncounterNotFoundForBodyCompositionError } from './errors/clinical-encounter-not-found-for-body-composition.error.js';
import { ClinicalEncounterNotOpenForBodyCompositionError } from './errors/clinical-encounter-not-open-for-body-composition.error.js';
import { ClinicalEncounterNutritionistMismatchError } from './errors/clinical-encounter-nutritionist-mismatch.error.js';
import { ClinicalEncounterPatientMismatchError } from './errors/clinical-encounter-patient-mismatch.error.js';
import { ClinicalEncounterTenantMismatchError } from './errors/clinical-encounter-tenant-mismatch.error.js';
import { NutritionistInactiveForBodyCompositionError } from './errors/nutritionist-inactive-for-body-composition.error.js';
import { NutritionistNotFoundForBodyCompositionError } from './errors/nutritionist-not-found-for-body-composition.error.js';
import { PatientInactiveForBodyCompositionError } from './errors/patient-inactive-for-body-composition.error.js';
import { PatientNotFoundForBodyCompositionError } from './errors/patient-not-found-for-body-composition.error.js';
import { TenantInactiveForBodyCompositionError } from './errors/tenant-inactive-for-body-composition.error.js';
import { TenantNotFoundForBodyCompositionError } from './errors/tenant-not-found-for-body-composition.error.js';

export function createBodyCompositionClinicalRecordContextErrors(): ClinicalRecordContextErrors {
  return {
    tenantNotFound: (tenantId) => new TenantNotFoundForBodyCompositionError(tenantId),
    tenantInactive: (tenantId) => new TenantInactiveForBodyCompositionError(tenantId),
    anamnesisNotFound: (tenantId, anamnesisId) =>
      new AnamnesisNotFoundForBodyCompositionError(tenantId, anamnesisId),
    anamnesisNotDraft: (tenantId, anamnesisId) =>
      new AnamnesisNotDraftForBodyCompositionError(tenantId, anamnesisId),
    anamnesisClinicalEncounterMismatch: (tenantId, anamnesisId, clinicalEncounterId) =>
      new AnamnesisClinicalEncounterMismatchForBodyCompositionError(
        tenantId,
        anamnesisId,
        clinicalEncounterId,
      ),
    anamnesisPatientMismatch: (tenantId, anamnesisId, patientId) =>
      new AnamnesisPatientMismatchForBodyCompositionError(
        tenantId,
        anamnesisId,
        patientId,
      ),
    anamnesisNutritionistMismatch: (tenantId, anamnesisId, nutritionistId) =>
      new AnamnesisNutritionistMismatchForBodyCompositionError(
        tenantId,
        anamnesisId,
        nutritionistId,
      ),
    clinicalEncounterNotFound: (tenantId, clinicalEncounterId) =>
      new ClinicalEncounterNotFoundForBodyCompositionError(
        tenantId,
        clinicalEncounterId,
      ),
    clinicalEncounterNotOpen: (tenantId, clinicalEncounterId) =>
      new ClinicalEncounterNotOpenForBodyCompositionError(
        tenantId,
        clinicalEncounterId,
      ),
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
      new PatientNotFoundForBodyCompositionError(tenantId, patientId),
    patientInactive: (tenantId, patientId) =>
      new PatientInactiveForBodyCompositionError(tenantId, patientId),
    nutritionistNotFound: (tenantId, nutritionistId) =>
      new NutritionistNotFoundForBodyCompositionError(tenantId, nutritionistId),
    nutritionistInactive: (tenantId, nutritionistId) =>
      new NutritionistInactiveForBodyCompositionError(tenantId, nutritionistId),
    nutritionistTenantMismatch: (tenantId, nutritionistId) =>
      new ClinicalEncounterTenantMismatchError(tenantId, 'nutritionist', nutritionistId),
    measuredAtFutureDate: (tenantId, patientId) =>
      new BodyCompositionAssessmentFutureDateError(tenantId, patientId),
    measuredAtBeforeBirth: (tenantId, patientId) =>
      new BodyCompositionAssessmentBeforeBirthError(tenantId, patientId),
  };
}
