import type {
  PatientScopedClinicalRecordCreationContext,
  PatientScopedClinicalRecordCreationContextErrors,
  PatientScopedClinicalRecordCreationContextRequest,
} from './patient-scoped-clinical-record-creation-context.js';
import {
  buildPatientScopedClinicalRecordCreationContext,
  validateActiveNutritionistForPatientScopedClinicalRecord,
} from './patient-scoped-clinical-record-creation-context.js';

export type PrescriptionCreationContextRequest =
  PatientScopedClinicalRecordCreationContextRequest;

export type PrescriptionCreationContextErrors =
  PatientScopedClinicalRecordCreationContextErrors;

export type PrescriptionCreationContext =
  PatientScopedClinicalRecordCreationContext;

export const buildPrescriptionCreationContext =
  buildPatientScopedClinicalRecordCreationContext;

export const validateActiveNutritionistForPrescription =
  validateActiveNutritionistForPatientScopedClinicalRecord;
