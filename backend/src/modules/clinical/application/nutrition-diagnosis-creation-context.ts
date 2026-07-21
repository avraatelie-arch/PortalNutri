import type {
  PatientScopedClinicalRecordCreationContext,
  PatientScopedClinicalRecordCreationContextErrors,
  PatientScopedClinicalRecordCreationContextRequest,
} from './patient-scoped-clinical-record-creation-context.js';
import {
  buildPatientScopedClinicalRecordCreationContext,
  validateActiveNutritionistForPatientScopedClinicalRecord,
} from './patient-scoped-clinical-record-creation-context.js';

export type NutritionDiagnosisCreationContextRequest =
  PatientScopedClinicalRecordCreationContextRequest;

export type NutritionDiagnosisCreationContextErrors =
  PatientScopedClinicalRecordCreationContextErrors;

export type NutritionDiagnosisCreationContext =
  PatientScopedClinicalRecordCreationContext;

export const buildNutritionDiagnosisCreationContext =
  buildPatientScopedClinicalRecordCreationContext;

export const validateActiveNutritionistForNutritionDiagnosis =
  validateActiveNutritionistForPatientScopedClinicalRecord;
