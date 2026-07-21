import type { MealPlanCreationContextErrors } from './meal-plan-creation-context.js';
import { AnamnesisNotFoundForMealPlanError } from './errors/anamnesis-not-found-for-meal-plan.error.js';
import { ClinicalEncounterNotFoundForMealPlanError } from './errors/clinical-encounter-not-found-for-meal-plan.error.js';
import { ClinicalEncounterNotOpenForMealPlanError } from './errors/clinical-encounter-not-open-for-meal-plan.error.js';
import { ClinicalEncounterPatientMismatchForMealPlanError } from './errors/clinical-encounter-patient-mismatch-for-meal-plan.error.js';
import { MealPlanOriginAnamnesisEncounterMismatchError } from './errors/meal-plan-origin-anamnesis-encounter-mismatch.error.js';
import { MealPlanOriginAnamnesisPatientMismatchError } from './errors/meal-plan-origin-anamnesis-patient-mismatch.error.js';
import { NutritionistInactiveForMealPlanError } from './errors/nutritionist-inactive-for-meal-plan.error.js';
import { NutritionistNotFoundForMealPlanError } from './errors/nutritionist-not-found-for-meal-plan.error.js';
import { PatientInactiveForMealPlanError } from './errors/patient-inactive-for-meal-plan.error.js';
import { PatientNotFoundForMealPlanError } from './errors/patient-not-found-for-meal-plan.error.js';
import { TenantInactiveForMealPlanError } from './errors/tenant-inactive-for-meal-plan.error.js';
import { TenantNotFoundForMealPlanError } from './errors/tenant-not-found-for-meal-plan.error.js';

export function createMealPlanCreationContextErrors(): MealPlanCreationContextErrors {
  return {
    tenantNotFound: (tenantId) => new TenantNotFoundForMealPlanError(tenantId),
    tenantInactive: (tenantId) => new TenantInactiveForMealPlanError(tenantId),
    patientNotFound: (tenantId, patientId) =>
      new PatientNotFoundForMealPlanError(tenantId, patientId),
    patientInactive: (tenantId, patientId) =>
      new PatientInactiveForMealPlanError(tenantId, patientId),
    nutritionistNotFound: (tenantId, nutritionistId) =>
      new NutritionistNotFoundForMealPlanError(tenantId, nutritionistId),
    nutritionistInactive: (tenantId, nutritionistId) =>
      new NutritionistInactiveForMealPlanError(tenantId, nutritionistId),
    clinicalEncounterNotFound: (tenantId, clinicalEncounterId) =>
      new ClinicalEncounterNotFoundForMealPlanError(
        tenantId,
        clinicalEncounterId,
      ),
    clinicalEncounterNotOpen: (tenantId, clinicalEncounterId) =>
      new ClinicalEncounterNotOpenForMealPlanError(
        tenantId,
        clinicalEncounterId,
      ),
    clinicalEncounterPatientMismatch: (tenantId, clinicalEncounterId, patientId) =>
      new ClinicalEncounterPatientMismatchForMealPlanError(
        tenantId,
        clinicalEncounterId,
        patientId,
      ),
    anamnesisNotFound: (tenantId, anamnesisId) =>
      new AnamnesisNotFoundForMealPlanError(tenantId, anamnesisId),
    originAnamnesisEncounterMismatch: (tenantId, anamnesisId, clinicalEncounterId) =>
      new MealPlanOriginAnamnesisEncounterMismatchError(
        tenantId,
        anamnesisId,
        clinicalEncounterId,
      ),
    originAnamnesisPatientMismatch: (tenantId, anamnesisId, patientId) =>
      new MealPlanOriginAnamnesisPatientMismatchError(
        tenantId,
        anamnesisId,
        patientId,
      ),
  };
}
