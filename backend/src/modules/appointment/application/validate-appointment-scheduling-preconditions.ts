import type { TenantDirectoryPort } from './ports/tenant-directory.port.js';
import type { PatientDirectoryPort } from './ports/patient-directory.port.js';
import type { NutritionistDirectoryPort } from './ports/nutritionist-directory.port.js';
import type { PatientNutritionistAssignmentDirectoryPort } from './ports/patient-nutritionist-assignment-directory.port.js';
import { TenantNotFoundForAppointmentError } from './errors/tenant-not-found-for-appointment.error.js';
import { TenantInactiveForAppointmentError } from './errors/tenant-inactive-for-appointment.error.js';
import { PatientNotFoundForAppointmentError } from './errors/patient-not-found-for-appointment.error.js';
import { PatientInactiveForAppointmentError } from './errors/patient-inactive-for-appointment.error.js';
import { NutritionistNotFoundForAppointmentError } from './errors/nutritionist-not-found-for-appointment.error.js';
import { NutritionistInactiveForAppointmentError } from './errors/nutritionist-inactive-for-appointment.error.js';
import { AppointmentTenantMismatchError } from './errors/appointment-tenant-mismatch.error.js';
import { PatientNutritionistAssignmentRequiredError } from './errors/patient-nutritionist-assignment-required.error.js';

export async function validateAppointmentSchedulingPreconditions(params: {
  tenantDirectory: TenantDirectoryPort;
  patientDirectory: PatientDirectoryPort;
  nutritionistDirectory: NutritionistDirectoryPort;
  assignmentDirectory: PatientNutritionistAssignmentDirectoryPort;
  tenantId: string;
  patientId: string;
  nutritionistId: string;
}): Promise<void> {
  const tenant = await params.tenantDirectory.findById(params.tenantId);

  if (!tenant) {
    throw new TenantNotFoundForAppointmentError(params.tenantId);
  }

  if (tenant.status !== 'ACTIVE') {
    throw new TenantInactiveForAppointmentError(params.tenantId);
  }

  const patient = await params.patientDirectory.findById(params.patientId);

  if (!patient) {
    throw new PatientNotFoundForAppointmentError(params.patientId);
  }

  if (patient.tenantId !== params.tenantId) {
    throw new AppointmentTenantMismatchError(
      params.tenantId,
      'patient',
      params.patientId,
    );
  }

  if (patient.status !== 'ACTIVE') {
    throw new PatientInactiveForAppointmentError(params.patientId);
  }

  const nutritionist = await params.nutritionistDirectory.findById(
    params.nutritionistId,
  );

  if (!nutritionist) {
    throw new NutritionistNotFoundForAppointmentError(params.nutritionistId);
  }

  if (nutritionist.tenantId !== params.tenantId) {
    throw new AppointmentTenantMismatchError(
      params.tenantId,
      'nutritionist',
      params.nutritionistId,
    );
  }

  if (nutritionist.status !== 'ACTIVE') {
    throw new NutritionistInactiveForAppointmentError(params.nutritionistId);
  }

  const hasAssignment = await params.assignmentDirectory.hasActiveAssignment(
    params.tenantId,
    params.patientId,
    params.nutritionistId,
  );

  if (!hasAssignment) {
    throw new PatientNutritionistAssignmentRequiredError(
      params.tenantId,
      params.patientId,
      params.nutritionistId,
    );
  }
}
