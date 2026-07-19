import type { TenantDirectoryPort } from './ports/tenant-directory.port.js';
import type { PatientDirectoryPort } from './ports/patient-directory.port.js';
import type { NutritionistDirectoryPort } from './ports/nutritionist-directory.port.js';
import { TenantNotFoundForEncounterError } from './errors/tenant-not-found-for-encounter.error.js';
import { TenantInactiveForEncounterError } from './errors/tenant-inactive-for-encounter.error.js';
import { PatientNotFoundForEncounterError } from './errors/patient-not-found-for-encounter.error.js';
import { PatientInactiveForEncounterError } from './errors/patient-inactive-for-encounter.error.js';
import { NutritionistNotFoundForEncounterError } from './errors/nutritionist-not-found-for-encounter.error.js';
import { NutritionistInactiveForEncounterError } from './errors/nutritionist-inactive-for-encounter.error.js';
import { ClinicalEncounterTenantMismatchError } from './errors/clinical-encounter-tenant-mismatch.error.js';

export async function validateClinicalEncounterStartPreconditions(params: {
  tenantDirectory: TenantDirectoryPort;
  patientDirectory: PatientDirectoryPort;
  nutritionistDirectory: NutritionistDirectoryPort;
  tenantId: string;
  patientId: string;
  nutritionistId: string;
}): Promise<void> {
  const tenant = await params.tenantDirectory.findById(params.tenantId);

  if (!tenant) {
    throw new TenantNotFoundForEncounterError(params.tenantId);
  }

  if (tenant.status !== 'ACTIVE') {
    throw new TenantInactiveForEncounterError(params.tenantId);
  }

  const patient = await params.patientDirectory.findById(params.patientId);

  if (!patient) {
    throw new PatientNotFoundForEncounterError(params.patientId);
  }

  if (patient.tenantId !== params.tenantId) {
    throw new ClinicalEncounterTenantMismatchError(
      params.tenantId,
      'patient',
      params.patientId,
    );
  }

  if (patient.status !== 'ACTIVE') {
    throw new PatientInactiveForEncounterError(params.patientId);
  }

  const nutritionist = await params.nutritionistDirectory.findById(
    params.nutritionistId,
  );

  if (!nutritionist) {
    throw new NutritionistNotFoundForEncounterError(params.nutritionistId);
  }

  if (nutritionist.tenantId !== params.tenantId) {
    throw new ClinicalEncounterTenantMismatchError(
      params.tenantId,
      'nutritionist',
      params.nutritionistId,
    );
  }

  if (nutritionist.status !== 'ACTIVE') {
    throw new NutritionistInactiveForEncounterError(params.nutritionistId);
  }
}
