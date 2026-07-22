import type { PrescriptionCreationContextErrors } from './prescription-creation-context.js';
import { AnamnesisNotFoundForPrescriptionError } from './errors/anamnesis-not-found-for-prescription.error.js';
import { ClinicalEncounterNotFoundForPrescriptionError } from './errors/clinical-encounter-not-found-for-prescription.error.js';
import { ClinicalEncounterNotOpenForPrescriptionError } from './errors/clinical-encounter-not-open-for-prescription.error.js';
import { ClinicalEncounterPatientMismatchForPrescriptionError } from './errors/clinical-encounter-patient-mismatch-for-prescription.error.js';
import { PrescriptionOriginAnamnesisEncounterMismatchError } from './errors/prescription-origin-anamnesis-encounter-mismatch.error.js';
import { PrescriptionOriginAnamnesisPatientMismatchError } from './errors/prescription-origin-anamnesis-patient-mismatch.error.js';
import { NutritionistInactiveForPrescriptionError } from './errors/nutritionist-inactive-for-prescription.error.js';
import { NutritionistNotFoundForPrescriptionError } from './errors/nutritionist-not-found-for-prescription.error.js';
import { PatientInactiveForPrescriptionError } from './errors/patient-inactive-for-prescription.error.js';
import { PatientNotFoundForPrescriptionError } from './errors/patient-not-found-for-prescription.error.js';
import { TenantInactiveForPrescriptionError } from './errors/tenant-inactive-for-prescription.error.js';
import { TenantNotFoundForPrescriptionError } from './errors/tenant-not-found-for-prescription.error.js';

export function createPrescriptionCreationContextErrors(): PrescriptionCreationContextErrors {
  return {
    tenantNotFound: (tenantId) => new TenantNotFoundForPrescriptionError(tenantId),
    tenantInactive: (tenantId) => new TenantInactiveForPrescriptionError(tenantId),
    patientNotFound: (tenantId, patientId) =>
      new PatientNotFoundForPrescriptionError(tenantId, patientId),
    patientInactive: (tenantId, patientId) =>
      new PatientInactiveForPrescriptionError(tenantId, patientId),
    nutritionistNotFound: (tenantId, nutritionistId) =>
      new NutritionistNotFoundForPrescriptionError(tenantId, nutritionistId),
    nutritionistInactive: (tenantId, nutritionistId) =>
      new NutritionistInactiveForPrescriptionError(tenantId, nutritionistId),
    clinicalEncounterNotFound: (tenantId, clinicalEncounterId) =>
      new ClinicalEncounterNotFoundForPrescriptionError(
        tenantId,
        clinicalEncounterId,
      ),
    clinicalEncounterNotOpen: (tenantId, clinicalEncounterId) =>
      new ClinicalEncounterNotOpenForPrescriptionError(
        tenantId,
        clinicalEncounterId,
      ),
    clinicalEncounterPatientMismatch: (tenantId, clinicalEncounterId, patientId) =>
      new ClinicalEncounterPatientMismatchForPrescriptionError(
        tenantId,
        clinicalEncounterId,
        patientId,
      ),
    anamnesisNotFound: (tenantId, anamnesisId) =>
      new AnamnesisNotFoundForPrescriptionError(tenantId, anamnesisId),
    originAnamnesisEncounterMismatch: (tenantId, anamnesisId, clinicalEncounterId) =>
      new PrescriptionOriginAnamnesisEncounterMismatchError(
        tenantId,
        anamnesisId,
        clinicalEncounterId,
      ),
    originAnamnesisPatientMismatch: (tenantId, anamnesisId, patientId) =>
      new PrescriptionOriginAnamnesisPatientMismatchError(
        tenantId,
        anamnesisId,
        patientId,
      ),
  };
}
