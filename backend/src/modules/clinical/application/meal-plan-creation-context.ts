import type {
  PatientScopedClinicalRecordCreationContext,
  PatientScopedClinicalRecordCreationContextErrors,
  PatientScopedClinicalRecordCreationContextRequest,
} from './patient-scoped-clinical-record-creation-context.js';
import {
  buildPatientScopedClinicalRecordCreationContext,
  validateActiveNutritionistForPatientScopedClinicalRecord,
} from './patient-scoped-clinical-record-creation-context.js';

export type MealPlanCreationContextRequest =
  PatientScopedClinicalRecordCreationContextRequest;

export type MealPlanCreationContextErrors =
  PatientScopedClinicalRecordCreationContextErrors;

export type MealPlanCreationContext =
  PatientScopedClinicalRecordCreationContext;

export const buildMealPlanCreationContext =
  buildPatientScopedClinicalRecordCreationContext;

export const validateActiveNutritionistForMealPlan =
  validateActiveNutritionistForPatientScopedClinicalRecord;
