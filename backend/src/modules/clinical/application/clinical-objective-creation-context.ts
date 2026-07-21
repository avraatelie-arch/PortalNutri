import type {
  PatientScopedClinicalRecordCreationContext,
  PatientScopedClinicalRecordCreationContextErrors,
  PatientScopedClinicalRecordCreationContextRequest,
} from './patient-scoped-clinical-record-creation-context.js';
import {
  buildPatientScopedClinicalRecordCreationContext,
  validateActiveNutritionistForPatientScopedClinicalRecord,
} from './patient-scoped-clinical-record-creation-context.js';

export type ClinicalObjectiveCreationContextRequest =
  PatientScopedClinicalRecordCreationContextRequest;

export type ClinicalObjectiveCreationContextErrors =
  PatientScopedClinicalRecordCreationContextErrors;

export type ClinicalObjectiveCreationContext =
  PatientScopedClinicalRecordCreationContext;

export const buildClinicalObjectiveCreationContext =
  buildPatientScopedClinicalRecordCreationContext;

export const validateActiveNutritionistForClinicalObjective =
  validateActiveNutritionistForPatientScopedClinicalRecord;
