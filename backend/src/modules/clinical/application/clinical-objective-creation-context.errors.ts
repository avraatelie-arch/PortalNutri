import type { ClinicalObjectiveCreationContextErrors } from './clinical-objective-creation-context.js';
import { AnamnesisNotFoundForClinicalObjectiveError } from './errors/anamnesis-not-found-for-clinical-objective.error.js';
import { ClinicalEncounterNotFoundForClinicalObjectiveError } from './errors/clinical-encounter-not-found-for-clinical-objective.error.js';
import { ClinicalEncounterNotOpenForClinicalObjectiveError } from './errors/clinical-encounter-not-open-for-clinical-objective.error.js';
import { ClinicalEncounterPatientMismatchForClinicalObjectiveError } from './errors/clinical-encounter-patient-mismatch-for-clinical-objective.error.js';
import { ClinicalObjectiveOriginAnamnesisEncounterMismatchError } from './errors/clinical-objective-origin-anamnesis-encounter-mismatch.error.js';
import { ClinicalObjectiveOriginAnamnesisPatientMismatchError } from './errors/clinical-objective-origin-anamnesis-patient-mismatch.error.js';
import { NutritionistInactiveForClinicalObjectiveError } from './errors/nutritionist-inactive-for-clinical-objective.error.js';
import { NutritionistNotFoundForClinicalObjectiveError } from './errors/nutritionist-not-found-for-clinical-objective.error.js';
import { PatientInactiveForClinicalObjectiveError } from './errors/patient-inactive-for-clinical-objective.error.js';
import { PatientNotFoundForClinicalObjectiveError } from './errors/patient-not-found-for-clinical-objective.error.js';
import { TenantInactiveForClinicalObjectiveError } from './errors/tenant-inactive-for-clinical-objective.error.js';
import { TenantNotFoundForClinicalObjectiveError } from './errors/tenant-not-found-for-clinical-objective.error.js';

export function createClinicalObjectiveCreationContextErrors(): ClinicalObjectiveCreationContextErrors {
  return {
    tenantNotFound: (tenantId) => new TenantNotFoundForClinicalObjectiveError(tenantId),
    tenantInactive: (tenantId) => new TenantInactiveForClinicalObjectiveError(tenantId),
    patientNotFound: (tenantId, patientId) =>
      new PatientNotFoundForClinicalObjectiveError(tenantId, patientId),
    patientInactive: (tenantId, patientId) =>
      new PatientInactiveForClinicalObjectiveError(tenantId, patientId),
    nutritionistNotFound: (tenantId, nutritionistId) =>
      new NutritionistNotFoundForClinicalObjectiveError(tenantId, nutritionistId),
    nutritionistInactive: (tenantId, nutritionistId) =>
      new NutritionistInactiveForClinicalObjectiveError(tenantId, nutritionistId),
    clinicalEncounterNotFound: (tenantId, clinicalEncounterId) =>
      new ClinicalEncounterNotFoundForClinicalObjectiveError(
        tenantId,
        clinicalEncounterId,
      ),
    clinicalEncounterNotOpen: (tenantId, clinicalEncounterId) =>
      new ClinicalEncounterNotOpenForClinicalObjectiveError(
        tenantId,
        clinicalEncounterId,
      ),
    clinicalEncounterPatientMismatch: (tenantId, clinicalEncounterId, patientId) =>
      new ClinicalEncounterPatientMismatchForClinicalObjectiveError(
        tenantId,
        clinicalEncounterId,
        patientId,
      ),
    anamnesisNotFound: (tenantId, anamnesisId) =>
      new AnamnesisNotFoundForClinicalObjectiveError(tenantId, anamnesisId),
    originAnamnesisEncounterMismatch: (tenantId, anamnesisId, clinicalEncounterId) =>
      new ClinicalObjectiveOriginAnamnesisEncounterMismatchError(
        tenantId,
        anamnesisId,
        clinicalEncounterId,
      ),
    originAnamnesisPatientMismatch: (tenantId, anamnesisId, patientId) =>
      new ClinicalObjectiveOriginAnamnesisPatientMismatchError(
        tenantId,
        anamnesisId,
        patientId,
      ),
  };
}
