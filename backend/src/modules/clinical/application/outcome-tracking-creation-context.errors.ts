import type { OutcomeTrackingCreationContextErrors } from './outcome-tracking-creation-context.js';
import { AnamnesisNotFoundForOutcomeTrackingError } from './errors/anamnesis-not-found-for-outcome-tracking.error.js';
import { ClinicalEncounterCancelledForOutcomeTrackingError } from './errors/clinical-encounter-cancelled-for-outcome-tracking.error.js';
import { ClinicalEncounterNotFoundForOutcomeTrackingError } from './errors/clinical-encounter-not-found-for-outcome-tracking.error.js';
import { ClinicalEncounterPatientMismatchForOutcomeTrackingError } from './errors/clinical-encounter-patient-mismatch-for-outcome-tracking.error.js';
import { ClinicalObjectiveNotAssessableForOutcomeTrackingError } from './errors/clinical-objective-not-assessable-for-outcome-tracking.error.js';
import { ClinicalObjectiveNotFoundForOutcomeTrackingError } from './errors/clinical-objective-not-found-for-outcome-tracking.error.js';
import { ClinicalObjectivePatientMismatchForOutcomeTrackingError } from './errors/clinical-objective-patient-mismatch-for-outcome-tracking.error.js';
import { NutritionistInactiveForOutcomeTrackingError } from './errors/nutritionist-inactive-for-outcome-tracking.error.js';
import { NutritionistNotFoundForOutcomeTrackingError } from './errors/nutritionist-not-found-for-outcome-tracking.error.js';
import { OutcomeTrackingOriginAnamnesisEncounterMismatchError } from './errors/outcome-tracking-origin-anamnesis-encounter-mismatch.error.js';
import { OutcomeTrackingOriginAnamnesisPatientMismatchError } from './errors/outcome-tracking-origin-anamnesis-patient-mismatch.error.js';
import { PatientInactiveForOutcomeTrackingError } from './errors/patient-inactive-for-outcome-tracking.error.js';
import { PatientNotFoundForOutcomeTrackingError } from './errors/patient-not-found-for-outcome-tracking.error.js';
import { TenantInactiveForOutcomeTrackingError } from './errors/tenant-inactive-for-outcome-tracking.error.js';
import { TenantNotFoundForOutcomeTrackingError } from './errors/tenant-not-found-for-outcome-tracking.error.js';

export function createOutcomeTrackingCreationContextErrors(): OutcomeTrackingCreationContextErrors {
  return {
    tenantNotFound: (tenantId) => new TenantNotFoundForOutcomeTrackingError(tenantId),
    tenantInactive: (tenantId) => new TenantInactiveForOutcomeTrackingError(tenantId),
    patientNotFound: (tenantId, patientId) =>
      new PatientNotFoundForOutcomeTrackingError(tenantId, patientId),
    patientInactive: (tenantId, patientId) =>
      new PatientInactiveForOutcomeTrackingError(tenantId, patientId),
    nutritionistNotFound: (tenantId, nutritionistId) =>
      new NutritionistNotFoundForOutcomeTrackingError(tenantId, nutritionistId),
    nutritionistInactive: (tenantId, nutritionistId) =>
      new NutritionistInactiveForOutcomeTrackingError(tenantId, nutritionistId),
    clinicalObjectiveNotFound: (tenantId, clinicalObjectiveId) =>
      new ClinicalObjectiveNotFoundForOutcomeTrackingError(
        tenantId,
        clinicalObjectiveId,
      ),
    clinicalObjectiveNotAssessable: (tenantId, clinicalObjectiveId, status) =>
      new ClinicalObjectiveNotAssessableForOutcomeTrackingError(
        tenantId,
        clinicalObjectiveId,
        status,
      ),
    clinicalObjectivePatientMismatch: (tenantId, clinicalObjectiveId, patientId) =>
      new ClinicalObjectivePatientMismatchForOutcomeTrackingError(
        tenantId,
        clinicalObjectiveId,
        patientId,
      ),
    clinicalEncounterNotFound: (tenantId, clinicalEncounterId) =>
      new ClinicalEncounterNotFoundForOutcomeTrackingError(
        tenantId,
        clinicalEncounterId,
      ),
    clinicalEncounterCancelled: (tenantId, clinicalEncounterId) =>
      new ClinicalEncounterCancelledForOutcomeTrackingError(
        tenantId,
        clinicalEncounterId,
      ),
    clinicalEncounterPatientMismatch: (tenantId, clinicalEncounterId, patientId) =>
      new ClinicalEncounterPatientMismatchForOutcomeTrackingError(
        tenantId,
        clinicalEncounterId,
        patientId,
      ),
    anamnesisNotFound: (tenantId, anamnesisId) =>
      new AnamnesisNotFoundForOutcomeTrackingError(tenantId, anamnesisId),
    originAnamnesisEncounterMismatch: (tenantId, anamnesisId, clinicalEncounterId) =>
      new OutcomeTrackingOriginAnamnesisEncounterMismatchError(
        tenantId,
        anamnesisId,
        clinicalEncounterId,
      ),
    originAnamnesisPatientMismatch: (tenantId, anamnesisId, patientId) =>
      new OutcomeTrackingOriginAnamnesisPatientMismatchError(
        tenantId,
        anamnesisId,
        patientId,
      ),
  };
}

export interface OutcomeTrackingNutritionistValidationErrors {
  nutritionistNotFound: (tenantId: string, nutritionistId: string) => Error;
  nutritionistInactive: (tenantId: string, nutritionistId: string) => Error;
}

export function createOutcomeTrackingNutritionistValidationErrors(): OutcomeTrackingNutritionistValidationErrors {
  return {
    nutritionistNotFound: (tenantId, nutritionistId) =>
      new NutritionistNotFoundForOutcomeTrackingError(tenantId, nutritionistId),
    nutritionistInactive: (tenantId, nutritionistId) =>
      new NutritionistInactiveForOutcomeTrackingError(tenantId, nutritionistId),
  };
}
